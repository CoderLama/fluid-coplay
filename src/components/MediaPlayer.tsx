/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ReactPlayer from 'react-player';
import { CoPlayer as PlayerModel, IPlayerData, ITimeSignalPayload } from '../PlayerModel';
import { PlayerControls} from './PlayerControl';
import { requestFullScreenOnElement, exitFullScreen} from '../utils/Utils';
import { PlayerState } from '../definitions';

// CSS
import './MediaPlayer.css';
import classNames from 'classnames';

export interface IMediaPlayerProps {
    model: PlayerModel;
}

export interface IMediaPlayerState {
    playerIsMuted: boolean;
    playerIsMaximized: boolean;
    playerIsLoaded: boolean;
    playerState: PlayerState;
    timeInMedia: number;
}

const outOfSyncTolerance = 2 //Seconds;

export class MediaPlayer extends React.Component<IMediaPlayerProps, IMediaPlayerState> {
    private mediaPlayer: ReactPlayer;

    constructor(props: IMediaPlayerProps) {
        super(props);

        const newState: IPlayerData = this.props.model.getState();

        this.state = {
            playerIsLoaded: newState.playerIsLoaded,
            playerIsMaximized: newState.playerIsMaximized,
            playerIsMuted: newState.playerIsMuted,
            playerState: newState.playerState,
            timeInMedia: newState.lastTimeInMedia || 0
        };
    }

    componentDidMount() {
        this.props.model.on('playerStateChanged', (newState: IPlayerData) => {
            this.setState({
                playerIsLoaded: newState.playerIsLoaded,
                playerIsMaximized: newState.playerIsMaximized,
                playerIsMuted: newState.playerIsMuted,
                playerState: newState.playerState,
            });
            if (newState.playerState === PlayerState.PAUSED && newState.lastTimeInMedia) {
                this.setState({timeInMedia: newState.lastTimeInMedia});
            }
        });
        this.props.model.onSignal((payload: ITimeSignalPayload ) => {
            if ( payload.isManualSeek || this.state.timeInMedia <= payload.timeInMedia)
                this.setState({timeInMedia: payload.timeInMedia});
            // else 
            //     console.log('Got a loser SIGNAL' + payload.timeInMedia+ payload.isManualSeek);
        })
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
	constructUserPlayerState = ( playerState, mediaPlayer ) => {
		return {
			playerState,
			timeInMedia: mediaPlayer.getCurrentTime ()
		};
	}
    
    togglePlayerMutedState = () => {this.props.model.updateState({playerIsMuted : !this.state.playerIsMuted})};
    onPlayerStateUpdateProposal = (newState) => {this.props.model.updatePlayerStateTime(newState)};

    handleMaximizeBtnPressed = ( playerCurrentlyMaximized: boolean, mediaPlayerElem ) => {
        if ( playerCurrentlyMaximized ) {
            exitFullScreen ()
        } else if ( !playerCurrentlyMaximized ) {
            requestFullScreenOnElement ( mediaPlayerElem )
        }

        this.props.model.updateState ( {playerIsMaximized : !playerCurrentlyMaximized});
    }

    render() {
        const mediaPlayer = this.mediaPlayer;
        const mediaIsPlaying = this.state.playerState === PlayerState.PLAYING;
        const mediaDuration = mediaPlayer && this.state.playerIsLoaded ? mediaPlayer.getDuration() : null
		const mediaPlayerClassNames = classNames ( 'video-player', {
			'maximized': this.state.playerIsMaximized
		} );
        return (
            <div className={mediaPlayerClassNames}>
            <ReactPlayer url='https://www.youtube.com/watch?v=10hXCKbfXAM'
                width={ '100%' }
                height={ '100%' }
                muted={ this.state.playerIsMuted }
                playing={ mediaIsPlaying }
                ref={e => this.mediaPlayer = e}
                onReady={() => {
                    this.props.model.updateState({playerIsLoaded : true});
                    // console.log('Player is ready')
                }}
                onPlay={() => {
                    this.props.model.updatePlayerStateTime(this.constructUserPlayerState (PlayerState.PLAYING, mediaPlayer ));
                }}
                onPause={() => {
                    this.props.model.updatePlayerStateTime(this.constructUserPlayerState (PlayerState.PAUSED, mediaPlayer ));
                    // console.log('Player is paused' + this.state.timeInMedia)
                }}
                onBuffer={() => {
                    // console.log('Player is bufferiung')
                }}
                onProgress={ (playerProgress:any) => {
                    this.props.model.updatePlayerStateTime(
                        {
                            playerState: this.state.playerState,
                            timeInMedia: playerProgress.playedSeconds
                        });
                    // console.log('Player is running');
                }} 
                style={ { position: 'absolute' } }
            />
            <PlayerControls 
                playerState={ this.state.playerState }
                onPlayerStateUpdateProposal={ this.onPlayerStateUpdateProposal }
                playerIsMuted={ this.state.playerIsMuted }
                playerIsMaximized={ this.state.playerIsMaximized }
                mediaProgress={ this.state.timeInMedia }
                mediaDuration={ mediaDuration }
                onMuteBtnPressed={ this.togglePlayerMutedState }
                onMaximizeBtnPressed={ () => this.handleMaximizeBtnPressed (
                    this.state.playerIsMaximized,
                    document.getElementsByClassName ( 'video-player' )[ 0 ]
                ) }
            />

            </div>
        )
    }
}