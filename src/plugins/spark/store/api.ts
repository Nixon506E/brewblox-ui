
import { del, get, post, put } from '@/helpers/fetch';
import notify from '@/helpers/notify';

import { Block, DataBlock, SystemStatus, UnitAlternatives, UserUnits } from '../types';
import { asBlock, asDataBlock } from './helpers';

const intercept =
  (message: string): ((e: Error) => never) =>
    (e: Error) => {
      notify.warn(`${message}: ${e.message}`);
      throw e;
    };

export const fetchBlocks = async (serviceId: string): Promise<Block[]> =>
  get(`/${encodeURIComponent(serviceId)}/objects`)
    .then(blocks => blocks.map((block: DataBlock) => asBlock(block, serviceId)))
    .catch(intercept(`Failed to fetch blocks from ${serviceId}`));

export const fetchBlock = async (block: Block): Promise<Block> =>
  get(`/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`)
    .then(fetched => asBlock(fetched, block.serviceId))
    .catch(intercept(`Failed to fetch ${block.id}`));

export const fetchStoredBlock = async (serviceId: string, id: string | number): Promise<Block> =>
  get(`/${encodeURIComponent(serviceId)}/stored_objects/${encodeURIComponent(id)}`)
    .then(fetched => asBlock(fetched, serviceId))
    .catch(intercept(`Failed to fetch stored block ${id}`));

export const createBlock = async (block: Block): Promise<Block> =>
  post(
    `/${encodeURIComponent(block.serviceId)}/objects`,
    asDataBlock(block),
  )
    .then(savedBlock => asBlock(savedBlock, block.serviceId))
    .catch(intercept(`Failed to create ${block.id}`));

export const persistBlock = async (block: Block): Promise<Block> =>
  put(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(savedBlock => asBlock(savedBlock, block.serviceId))
    .catch(intercept(`Failed to persist ${block.id}`));

export const renameBlock =
  async (serviceId: string, currentId: string, newId: string): Promise<any> =>
    put(
      `/${encodeURIComponent(serviceId)}/aliases/${encodeURIComponent(currentId)}`,
      { id: newId },
    )
      .catch(intercept(`Failed to rename ${currentId}`));

export const deleteBlock = async (block: Block): Promise<string> =>
  del(
    `/${encodeURIComponent(block.serviceId)}/objects/${encodeURIComponent(block.id)}`,
    asDataBlock(block),
  )
    .then(response => response.id)
    .catch(intercept(`Failed to delete ${block.id}`));

export const clearBlocks = async (serviceId: string): Promise<any> =>
  del(`/${encodeURIComponent(serviceId)}/objects`, {})
    .catch(intercept(`Failed to clear blocks on ${serviceId}`));

export const cleanUnusedNames = async (serviceId: string): Promise<string[]> =>
  del(`/${encodeURIComponent(serviceId)}/unused_names`, {})
    .catch(intercept(`Failed to clean unused block names on ${serviceId}`));

export const fetchUnits = async (serviceId: string): Promise<UserUnits> =>
  get(`/${encodeURIComponent(serviceId)}/codec/units`)
    .catch(intercept(`Failed to fetch unit settings on ${serviceId}`));

export const persistUnits = async (serviceId: string, units: UserUnits): Promise<UserUnits> =>
  put(`/${encodeURIComponent(serviceId)}/codec/units`, units)
    .catch(intercept(`Failed to persist unit settings on ${serviceId}`));

export const fetchUnitAlternatives = async (serviceId: string): Promise<UnitAlternatives> =>
  get(`/${encodeURIComponent(serviceId)}/codec/unit_alternatives`)
    .catch(intercept(`Failed to fetch unit alternatives on ${serviceId}`));

export const fetchCompatibleTypes = async (serviceId: string): Promise<Mapped<string[]>> =>
  get(`/${encodeURIComponent(serviceId)}/codec/compatible_types`)
    .catch(intercept(`Failed to fetch compatible types on ${serviceId}`));

export const fetchDiscoveredBlocks = async (serviceId: string): Promise<string[]> =>
  get(`/${encodeURIComponent(serviceId)}/discover_objects`)
    .catch(intercept(`Failed to discover objects on ${serviceId}`));

export const validateService = async (serviceId: string): Promise<boolean> =>
  get(`/${encodeURIComponent(serviceId)}/_service/status`)
    .then(retv => retv.status === 'ok')
    .catch(() => false);

export const fetchSystemStatus = async (serviceId: string): Promise<SystemStatus> => {
  try {
    const retv: SystemStatus = await get(`/${encodeURIComponent(serviceId)}/system/status`);
    return {
      ...retv,
      available: true,
      checkedAt: new Date(),
    };
  } catch (error) {
    return {
      checkedAt: new Date(),
      available: false,
      connect: false,
      handshake: false,
      synchronize: false,
      compatible: true, // no idea - assume yes
      latest: true, // no idea - assume yes
      valid: true, // no idea - assume yes
      info: [],
      error,
    };
  }
};

export const flashFirmware = async (serviceId: string): Promise<any> =>
  post(`/${encodeURIComponent(serviceId)}/system/flash`, {})
    .catch(intercept(`Failed to update firmware on ${serviceId}`));

export const serviceExport = async (serviceId: string): Promise<any> =>
  get(`/${encodeURIComponent(serviceId)}/export_objects`)
    .catch(intercept(`Failed to fetch stored blocks from ${serviceId}`));

export const serviceImport = async (serviceId: string, exported: any): Promise<string[]> =>
  post(`/${encodeURIComponent(serviceId)}/import_objects`, exported)
    .catch(intercept(`Failed to reset stored blocks in ${serviceId}`));
