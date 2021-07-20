import React from "react";
import ReactDOM from "react-dom";
import {
    ContainerRuntimeFactoryWithDefaultDataStore,
    DataObject,
    DataObjectFactory,
} from "@fluidframework/aqueduct";
import { IFluidHTMLView } from "@fluidframework/view-interfaces";
import { IInboundSignalMessage } from "@fluidframework/runtime-definitions";
import { IDirectoryValueChanged } from "@fluidframework/map";
import { MediaPlayer } from "./components/MediaPlayer";
import { PlayerState } from "./definitions";

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

export class CoPlayer extends DataObject implements IFluidHTMLView {
    public get IFluidHTMLView() {
        return this;
    }

    static get FluidObjectName() {
        return "@fluid-example/CoPlay";
    }

    static factory = new DataObjectFactory(CoPlayer.FluidObjectName, CoPlayer, [], {});

    protected async initializingFirstTime() {
        this.root.set(playerStateKey, {
            playerIsMuted: false,
            playerIsMaximized: false,
            playerIsLoaded: false,
            playerState: PlayerState.UNSTARTED,
            lastTimeInMedia: 0,
        });
    }

    protected async hasInitialized() {
        this.root.on("valueChanged", (changed: IDirectoryValueChanged) => {
            if (changed.key === playerStateKey) {
                this.emit("playerStateChanged", this.getState());
            }
        });
    }

    /**
     * Will return a new Table view
     */
    public render(div: HTMLElement) {
        ReactDOM.render(<MediaPlayer model={this} />, div);
        return div;
    }

    public updateState(newState: Partial<IPlayerData>) {
        this.root.set(playerStateKey, { ...this.getState(), ...newState });
    }

    public setState(newState: IPlayerData) {
        this.root.set(playerStateKey, newState);
    }

    public getState(): IPlayerData {
        return this.root.get(playerStateKey);
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

export const CoPlayerContainerFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
    CoPlayer.factory,
    [[CoPlayer.FluidObjectName, Promise.resolve(CoPlayer.factory)]]
);
