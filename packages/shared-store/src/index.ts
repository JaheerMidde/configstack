import type { DeviceContext, DeviceType, PlanLookup, Selection, ValidationError } from '@configstack/shared-types';
import {
  buildStackFromSelections,
  validateConfigurationStack
} from '@configstack/shared-validation';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const serverStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export type ConfiguratorState = {
  deviceContextStack: DeviceContext[];
  activeDeviceId: string | null;
  selectionsByDeviceId: Record<string, Selection>;
  plans: PlanLookup[];
  hasHydrated: boolean;
  setPlans: (plans: PlanLookup[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  addDevice: (type: DeviceType) => string;
  switchDevice: (id: string) => void;
  updateSelection: (deviceId: string, field: keyof Selection, value: string | boolean) => void;
  removeDevice: (id: string) => void;
  validateStack: () => ValidationError[];
  hydrateFromSession: (stack: DeviceContext[], activeDeviceId: string | null) => void;
  resetConfiguration: () => void;
  getStackSnapshot: () => DeviceContext[];
};

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      deviceContextStack: [],
      activeDeviceId: null,
      selectionsByDeviceId: {},
      plans: [],
      hasHydrated: false,

      setPlans: (plans) => set({ plans }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addDevice: (type) => {
        const id = crypto.randomUUID();
        const stackOrder = get().deviceContextStack.length;
        const device: DeviceContext = {
          id,
          deviceType: type,
          stackOrder,
          selections: {},
        };

        set((state) => ({
          deviceContextStack: [...state.deviceContextStack, device],
          activeDeviceId: id,
          selectionsByDeviceId: {
            ...state.selectionsByDeviceId,
            [id]: {},
          },
        }));

        return id;
      },

      switchDevice: (id) => {
        const exists = get().deviceContextStack.some((d) => d.id === id);
        if (exists) {
          set({ activeDeviceId: id });
        }
      },

      updateSelection: (deviceId, field, value) => {
        set((state) => ({
          selectionsByDeviceId: {
            ...state.selectionsByDeviceId,
            [deviceId]: {
              ...state.selectionsByDeviceId[deviceId],
              [field]: value,
            },
          },
        }));
      },

      removeDevice: (id) => {
        set((state) => {
          const nextStack = state.deviceContextStack.filter((d) => d.id !== id);
          const restSelections = { ...state.selectionsByDeviceId };
          delete restSelections[id];
          const nextActive =
            state.activeDeviceId === id
              ? (nextStack.at(-1)?.id ?? null)
              : state.activeDeviceId;

          return {
            deviceContextStack: nextStack.map((d, index) => ({ ...d, stackOrder: index })),
            selectionsByDeviceId: restSelections,
            activeDeviceId: nextActive,
          };
        });
      },

      validateStack: () => {
        const { deviceContextStack, selectionsByDeviceId, plans } = get();
        const stack = buildStackFromSelections(deviceContextStack, selectionsByDeviceId);
        return validateConfigurationStack({ stack, plans });
      },

      hydrateFromSession: (stack, activeDeviceId) => {
        const selectionsByDeviceId: Record<string, Selection> = {};
        for (const device of stack) {
          selectionsByDeviceId[device.id] = device.selections;
        }
        set({
          deviceContextStack: stack,
          activeDeviceId,
          selectionsByDeviceId,
        });
      },

      resetConfiguration: () => {
        set({
          deviceContextStack: [],
          activeDeviceId: null,
          selectionsByDeviceId: {},
        });
      },

      getStackSnapshot: () => {
        const { deviceContextStack, selectionsByDeviceId } = get();
        return buildStackFromSelections(deviceContextStack, selectionsByDeviceId);
      },
    }),
    {
      name: 'configstack:configuration',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? serverStorage : window.localStorage
      ),
      partialize: (state) => ({
        deviceContextStack: state.deviceContextStack,
        activeDeviceId: state.activeDeviceId,
        selectionsByDeviceId: state.selectionsByDeviceId,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
