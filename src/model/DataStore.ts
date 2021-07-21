import { EventEmitter } from "events";
import { IInboundSignalMessage } from "@fluidframework/runtime-definitions";
import { IFluidDataStoreRuntime } from "@fluidframework/datastore-definitions";
import { IDirectory, IDirectoryValueChanged } from "@fluidframework/map";
import { PlayerState } from "../definitions";

export enum DataStoreKeys {
    playerIsMuted = "playerIsMuted",
    playerIsMaximized = "playerIsMaximized",
    playerIsLoaded = "playerIsLoaded",
    playerState = "playerState",
    lastTimeInMedia = "lastTimeInMedia",
    mediaProgress = "mediaProgress",
}

export interface ITimeSignalPayload {
    timeInMedia: number;
    isManualSeek: boolean;
}

const playerTimeInMediaKey = "timeInMedia";

export class DataStore extends EventEmitter {
    // eslint-disable-next-line @typescript-eslint/prefer-readonly
    private sharedStore: IDirectory;
    // eslint-disable-next-line @typescript-eslint/prefer-readonly
    private runtime: IFluidDataStoreRuntime;

    constructor(store: IDirectory, runtime: IFluidDataStoreRuntime) {
        super();
        this.sharedStore = store;
        this.runtime = runtime;
    }

    public initializingFirstTime() {
        this.updateDataStore(DataStoreKeys.playerIsMuted, false);
        this.updateDataStore(DataStoreKeys.playerIsMaximized, false);
        this.updateDataStore(DataStoreKeys.playerIsLoaded, false);
        this.updateDataStore(DataStoreKeys.playerState, PlayerState.UNSTARTED);
        this.updateDataStore(DataStoreKeys.lastTimeInMedia, 0);
    }

    public onDataChange(callback: (dataKey: DataStoreKeys, value: any) => void) {
        this.sharedStore.on("valueChanged", (changed: IDirectoryValueChanged) => {
            const dataKey = DataStoreKeys[changed.key as keyof typeof DataStoreKeys];
            callback(dataKey, this.getDataForKey(dataKey));
        });
    }

    public updateDataStore(dataKey: DataStoreKeys, value: any) {
        // console.log(` Updating ${dataKey.toString()}${value}`);
        this.sharedStore.set(dataKey.toString(), value);
    }

    public getDataForKey(dataKey: DataStoreKeys) {
        return this.sharedStore.get(dataKey.toString());
    }

    public onTimeInMediaSignal = (listener: (payload: ITimeSignalPayload) => void) => {
        this.runtime.on("signal", (message: IInboundSignalMessage, local: boolean) => {
            if (message.type === playerTimeInMediaKey) {
                const payload: ITimeSignalPayload = message.content;

                listener(payload);
            }
        });
    };

    public updatePlayerStateTime = playerState => {
        const currPlayerState: PlayerState = this.getDataForKey(DataStoreKeys.playerState);
        // console.log('New state : [' + playerState.playerState +',' + playerState.timeInMedia + value.lastTimeInMedia + ']')

        this.runtime.submitSignal(playerTimeInMediaKey, {
            timeInMedia: playerState.timeInMedia,
            isManualSeek: playerState?.isManualSeek || false,
        });

        if (currPlayerState !== playerState.playerState) {
            if (playerState.playerState === PlayerState.PAUSED) {
                this.updateDataStore(DataStoreKeys.lastTimeInMedia, playerState.timeInMedia);
            }
            this.updateDataStore(DataStoreKeys.playerState, playerState.playerState);
        }
    };
}
