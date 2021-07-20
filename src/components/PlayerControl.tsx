// Libs & utils
import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faPause,
    faVolumeOff,
    faVolumeUp,
    faArrowsAlt,
    faMinusSquare,
} from "@fortawesome/free-solid-svg-icons";
import { secondsToPixels, toHHMMSS, getAmountOfSecondsAtXPos } from "../utils/Utils";
import { PlayerState } from "../definitions";

// CSS
// eslint-disable-next-line import/no-unassigned-import
import "./PlayerControl.css";

export interface IPlayerControlProps {
    playerState: PlayerState;
    onPlayerStateUpdateProposal: Function;
    playerIsMuted: boolean;
    playerIsMaximized: boolean;
    mediaProgress: number;
    mediaDuration?: number;
    onMuteBtnPressed: any;
    onMaximizeBtnPressed: any;
}

export class PlayerControls extends Component<IPlayerControlProps> {
    private progressBar;

    render() {
        const {
            playerState,
            onPlayerStateUpdateProposal,
            playerIsMuted,
            playerIsMaximized,
            mediaProgress,
            mediaDuration,
            onMuteBtnPressed,
            onMaximizeBtnPressed,
        } = this.props;

        if (!mediaDuration) {
            return false;
        }
        const mediaIsPlaying = playerState === PlayerState.PLAYING;
        const mediaIsMuted = playerIsMuted;
        const mediaIsMaximized = playerIsMaximized;
        const progressBarWidth = this.progressBar ? this.progressBar.offsetWidth : undefined;
        const progressInSeconds = mediaProgress;
        const progressInPixels = secondsToPixels(
            progressInSeconds,
            progressBarWidth,
            mediaDuration
        );
        const formattedProgressString = toHHMMSS(progressInSeconds);
        // console.log('formatted time ' + formattedProgressString + ', ' + progressInPixels + ', ' + mediaDuration)
        const playBtnClassNames = "player-btn btn-left";
        const playIconName = !mediaIsPlaying ? faPlay : faPause;
        const muteBtnClassNames = "player-btn btn-left";
        const muteIconName = mediaIsMuted ? faVolumeOff : faVolumeUp;
        const maximizeBtnClassNames = "player-btn btn-right";
        const maximizeIconName = !mediaIsMaximized ? faArrowsAlt : faMinusSquare;

        return (
            <div
                className="player-controls-overlay"
                onClick={() => {
                    onPlayerStateUpdateProposal({
                        playerState: mediaIsPlaying ? PlayerState.PAUSED : PlayerState.PLAYING,
                        timeInMedia: progressInSeconds,
                    });
                }}>
                <div className="control-bar bottom" onClick={event => event.stopPropagation()}>
                    <div
                        className="progress-bar"
                        ref={e => {
                            this.progressBar = e;
                        }}
                        onClick={event => {
                            onPlayerStateUpdateProposal({
                                playerState: mediaIsPlaying
                                    ? PlayerState.PLAYING
                                    : PlayerState.PAUSED,
                                timeInMedia: getAmountOfSecondsAtXPos(event, mediaDuration),
                                isManualSeek: true,
                            });
                        }}>
                        <div className="background-bar"></div>
                        <div
                            className="progress-indicator"
                            style={{ left: progressInPixels }}></div>
                    </div>

                    <div className="control-buttons">
                        <span
                            className={playBtnClassNames}
                            onClick={() => {
                                onPlayerStateUpdateProposal({
                                    playerState: mediaIsPlaying
                                        ? PlayerState.PAUSED
                                        : PlayerState.PLAYING,
                                    timeInMedia: progressInSeconds,
                                });
                            }}>
                            <FontAwesomeIcon icon={playIconName} />
                        </span>
                        <span className={muteBtnClassNames} onClick={onMuteBtnPressed}>
                            <FontAwesomeIcon icon={muteIconName} />
                        </span>
                        <span className="current-time">{formattedProgressString}</span>

                        <span className={maximizeBtnClassNames} onClick={onMaximizeBtnPressed}>
                            <FontAwesomeIcon icon={maximizeIconName} />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
