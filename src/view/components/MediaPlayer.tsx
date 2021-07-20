import React from "react";
import ReactPlayer from "react-player";
import classNames from "classnames";
import { requestFullScreenOnElement, exitFullScreen } from "../../utils/Utils";
import { PlayerState } from "../../definitions";
import { DataStore, IPlayerData, ITimeSignalPayload } from "../../model/DataStore";
import { PlayerControls } from "./PlayerControl";

// eslint-disable-next-line import/no-unassigned-import
import "./MediaPlayer.css";

export interface IMediaPlayerProps {
    dataStore: DataStore;
}

export interface IMediaPlayerState {
    playerIsMuted: boolean;
    playerIsMaximized: boolean;
    playerIsLoaded: boolean;
    playerState: PlayerState;
    timeInMedia: number;
}

const outOfSyncTolerance = 2; // Seconds

export class MediaPlayer extends React.Component<IMediaPlayerProps, IMediaPlayerState> {
    private mediaPlayer: ReactPlayer;

    constructor(props: IMediaPlayerProps) {
        super(props);

        const newState: IPlayerData = this.props.dataStore.getState();

        this.state = {
            playerIsLoaded: newState.playerIsLoaded,
            playerIsMaximized: newState.playerIsMaximized,
            playerIsMuted: newState.playerIsMuted,
            playerState: newState.playerState,
            timeInMedia: newState.lastTimeInMedia || 0,
        };
    }

    componentDidMount() {
        this.props.dataStore.on("playerStateChanged", (newState: IPlayerData) => {
            this.setState({
                playerIsLoaded: newState.playerIsLoaded,
                playerIsMaximized: newState.playerIsMaximized,
                playerIsMuted: newState.playerIsMuted,
                playerState: newState.playerState,
            });
            if (newState.playerState === PlayerState.PAUSED && newState.lastTimeInMedia) {
                this.setState({ timeInMedia: newState.lastTimeInMedia });
            }
        });
        this.props.dataStore.onSignal((payload: ITimeSignalPayload) => {
            if (payload.isManualSeek || this.state.timeInMedia <= payload.timeInMedia)
                this.setState({ timeInMedia: payload.timeInMedia });
            // else
            //     console.log('Got a loser SIGNAL' + payload.timeInMedia+ payload.isManualSeek);
        });
    }

    componentDidUpdate(prevProps, prevState: IMediaPlayerState) {
        if (Math.abs(prevState.timeInMedia - this.state.timeInMedia) > outOfSyncTolerance) {
            // console.log('Seeking');
            this.mediaPlayer.seekTo(this.state.timeInMedia);
        }
    }

    /**
     * Returns a users' playerState object containing the playerState and timeInMedia
     * @param playerState
     * @param mediaPlayer
     * @returns {{playerState: *, timeInMedia}}
     */
    constructUserPlayerState = (playerState, mediaPlayer) => {
        return {
            playerState,
            timeInMedia: mediaPlayer.getCurrentTime(),
        };
    };

    togglePlayerMutedState = () => {
        this.props.dataStore.updateState({ playerIsMuted: !this.state.playerIsMuted });
    };

    onPlayerStateUpdateProposal = newState => {
        this.props.dataStore.updatePlayerStateTime(newState);
    };

    handleMaximizeBtnPressed = (playerCurrentlyMaximized: boolean, mediaPlayerElem) => {
        if (playerCurrentlyMaximized) {
            exitFullScreen();
        } else if (!playerCurrentlyMaximized) {
            requestFullScreenOnElement(mediaPlayerElem);
        }

        this.props.dataStore.updateState({ playerIsMaximized: !playerCurrentlyMaximized });
    };

    render() {
        const mediaPlayer = this.mediaPlayer;
        const mediaIsPlaying = this.state.playerState === PlayerState.PLAYING;
        const mediaDuration =
            mediaPlayer && this.state.playerIsLoaded ? mediaPlayer.getDuration() : undefined;
        const mediaPlayerClassNames = classNames("video-player", {
            maximized: this.state.playerIsMaximized,
        });
        return (
            <div className={mediaPlayerClassNames}>
                <ReactPlayer
                    url="https://www.youtube.com/watch?v=10hXCKbfXAM"
                    width={"100%"}
                    height={"100%"}
                    muted={this.state.playerIsMuted}
                    playing={mediaIsPlaying}
                    ref={e => (this.mediaPlayer = e)}
                    onReady={() => {
                        this.props.dataStore.updateState({ playerIsLoaded: true });
                        // console.log('Player is ready')
                    }}
                    onPlay={() => {
                        this.props.dataStore.updatePlayerStateTime(
                            this.constructUserPlayerState(PlayerState.PLAYING, mediaPlayer)
                        );
                    }}
                    onPause={() => {
                        this.props.dataStore.updatePlayerStateTime(
                            this.constructUserPlayerState(PlayerState.PAUSED, mediaPlayer)
                        );
                        // console.log('Player is paused' + this.state.timeInMedia)
                    }}
                    onBuffer={() => {
                        // console.log('Player is bufferiung')
                    }}
                    onProgress={(playerProgress: any) => {
                        this.props.dataStore.updatePlayerStateTime({
                            playerState: this.state.playerState,
                            timeInMedia: playerProgress.playedSeconds,
                        });
                        // console.log('Player is running');
                    }}
                    style={{ position: "absolute" }}
                />
                <PlayerControls
                    playerState={this.state.playerState}
                    onPlayerStateUpdateProposal={this.onPlayerStateUpdateProposal}
                    playerIsMuted={this.state.playerIsMuted}
                    playerIsMaximized={this.state.playerIsMaximized}
                    mediaProgress={this.state.timeInMedia}
                    mediaDuration={mediaDuration}
                    onMuteBtnPressed={this.togglePlayerMutedState}
                    onMaximizeBtnPressed={() =>
                        this.handleMaximizeBtnPressed(
                            this.state.playerIsMaximized,
                            document.getElementsByClassName("video-player")[0]
                        )
                    }
                />
            </div>
        );
    }
}
