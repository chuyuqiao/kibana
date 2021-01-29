/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CoreSetup, SavedObjectsClientContract } from '../../../../../src/core/server';
import { CollectorFetchContext } from '../../../../../src/plugins/usage_collection/server';
import { CollectorDependencies } from './types';
import {
  DetectionsUsage,
  fetchDetectionsUsage,
  defaultDetectionsUsage,
  fetchDetectionsMetrics,
} from './detections';
import { EndpointUsage, getEndpointTelemetryFromFleet } from './endpoints';

export type RegisterCollector = (deps: CollectorDependencies) => void;
export interface UsageData {
  detections: DetectionsUsage;
  endpoints: EndpointUsage | {};
  detectionMetrics: {};
}

export async function getInternalSavedObjectsClient(core: CoreSetup) {
  return core.getStartServices().then(async ([coreStart]) => {
    return coreStart.savedObjects.createInternalRepository();
  });
}

export const registerCollector: RegisterCollector = ({
  core,
  kibanaIndex,
  ml,
  usageCollection,
}) => {
  if (!usageCollection) {
    return;
  }
  const collector = usageCollection.makeUsageCollector<UsageData>({
    type: 'security_solution',
    schema: {
      detections: {
        detection_rules: {
          custom: {
            enabled: { type: 'long' },
            disabled: { type: 'long' },
          },
          elastic: {
            enabled: { type: 'long' },
            disabled: { type: 'long' },
          },
        },
        ml_jobs: {
          custom: {
            enabled: { type: 'long' },
            disabled: { type: 'long' },
          },
          elastic: {
            enabled: { type: 'long' },
            disabled: { type: 'long' },
          },
        },
      },
      detectionMetrics: {
        ml_jobs: {
          type: 'array',
          items: {
            // @pjhampton: these are still undecided - taking id and times for now
            job_id: { type: 'keyword' },
            time_start: { type: 'long' },
            time_finish: { type: 'long' },
          },
        },
      },
      endpoints: {
        total_installed: { type: 'long' },
        active_within_last_24_hours: { type: 'long' },
        os: {
          type: 'array',
          items: {
            full_name: { type: 'keyword' },
            platform: { type: 'keyword' },
            version: { type: 'keyword' },
            count: { type: 'long' },
          },
        },
        policies: {
          malware: {
            active: { type: 'long' },
            inactive: { type: 'long' },
            failure: { type: 'long' },
          },
        },
      },
    },
    isReady: () => kibanaIndex.length > 0,
    fetch: async ({ esClient }: CollectorFetchContext): Promise<UsageData> => {
      const internalSavedObjectsClient = await getInternalSavedObjectsClient(core);
      const savedObjectsClient = (internalSavedObjectsClient as unknown) as SavedObjectsClientContract;
      const [detections, detectionMetrics, endpoints] = await Promise.allSettled([
        fetchDetectionsUsage(kibanaIndex, esClient, ml, savedObjectsClient),
        fetchDetectionsMetrics(ml, savedObjectsClient),
        getEndpointTelemetryFromFleet(internalSavedObjectsClient),
      ]);

      return {
        detections: detections.status === 'fulfilled' ? detections.value : defaultDetectionsUsage,
        detectionMetrics: detectionMetrics.status === 'fulfilled' ? detectionMetrics.value : {},
        endpoints: endpoints.status === 'fulfilled' ? endpoints.value : {},
      };
    },
  });

  usageCollection.registerCollector(collector);
};
