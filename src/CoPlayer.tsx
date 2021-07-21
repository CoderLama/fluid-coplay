import React from "react";
import ReactDOM from "react-dom";
import {
    ContainerRuntimeFactoryWithDefaultDataStore,
    DataObject,
    DataObjectFactory,
} from "@fluidframework/aqueduct";
import { IFluidHTMLView } from "@fluidframework/view-interfaces";
import { MediaPlayer } from "./view/components/MediaPlayer";
import { DataStore } from "./model/DataStore";

export class CoPlayer extends DataObject implements IFluidHTMLView {
    private dataStore: DataStore;

    public get IFluidHTMLView() {
        return this;
    }

    static get FluidObjectName() {
        return "@fluid-example/CoPlay";
    }

    static factory = new DataObjectFactory(CoPlayer.FluidObjectName, CoPlayer, [], {});

    protected async initializingFirstTime() {
        this.dataStore = new DataStore(this.root, this.runtime);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.dataStore.initializingFirstTime();
    }

    protected async hasInitialized() {
        if (this.dataStore === undefined) this.dataStore = new DataStore(this.root, this.runtime);
    }

    /**
     * Will return a new Table view
     */
    public render(div: HTMLElement) {
        ReactDOM.render(<MediaPlayer dataStore={this.dataStore} />, div);
        return div;
    }
}

export const CoPlayerContainerFactory = new ContainerRuntimeFactoryWithDefaultDataStore(
    CoPlayer.factory,
    [[CoPlayer.FluidObjectName, Promise.resolve(CoPlayer.factory)]]
);
