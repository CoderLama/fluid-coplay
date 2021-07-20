import { EventEmitter } from "events";
import { IInboundSignalMessage } from "@fluidframework/runtime-definitions";
import { IFluidDataStoreRuntime } from "@fluidframework/datastore-definitions";
import { IDirectory, IDirectoryValueChanged } from "@fluidframework/map";
import { PlayerState } from "../definitions";

export interface IPlayerData {
    playerIsMuted: boolean;
    playerIsMaximized: boolean;
    playerIsLoaded: boolean;
    playerState: PlayerState;
    lastTimeInMedia: number;
    mediaProgress: number;
}

export interface ITimeSignalPayload {
    timeInMedia: number;
    isManualSeek: boolean;
}

const playerStateKey = "playerState";
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
        this.sharedStore.set(playerStateKey, {
            playerIsMuted: false,
            playerIsMaximized: false,
            playerIsLoaded: false,
            playerState: PlayerState.UNSTARTED,
            lastTimeInMedia: 0,
        });
    }

    public listenToDataChange() {
        this.sharedStore.on("valueChanged", (changed: IDirectoryValueChanged) => {
            if (changed.key === playerStateKey) {
                this.emit("playerStateChanged", this.getState());
            }
        });
    }

    public updateState(newState: Partial<IPlayerData>) {
        this.sharedStore.set(playerStateKey, { ...this.getState(), ...newState });
    }

    public setState(newState: IPlayerData) {
        this.sharedStore.set(playerStateKey, newState);
    }

    public getState(): IPlayerData {
        return this.sharedStore.get(playerStateKey);
    }

    public onSignal = (listener: (payload: ITimeSignalPayload) => void) => {
        this.runtime.on("signal", (message: IInboundSignalMessage, local: boolean) => {
            if (message.type === playerTimeInMediaKey) {
                const payload: ITimeSignalPayload = message.content;

                listener(payload);
            }
        });
    };

    public updatePlayerStateTime = playerState => {
        const value: IPlayerData = { ...this.getState() };
        // console.log('New state : [' + playerState.playerState +',' + playerState.timeInMedia + value.lastTimeInMedia + ']')

        this.runtime.submitSignal(playerTimeInMediaKey, {
            timeInMedia: playerState.timeInMedia,
            isManualSeek: playerState?.isManualSeek || false,
        });

        if (value.playerState !== playerState.playerState) {
            value.playerState = playerState.playerState;
            if (playerState.playerState === PlayerState.PAUSED) {
                value.lastTimeInMedia = playerState.timeInMedia;
            }
            this.setState(value);
        }
    };
}
