import React from 'react';
import { Channel } from '../types';
import { StreamPlayer, StreamPlayerProps } from './StreamPlayer';

export type VideoPlayerProps = StreamPlayerProps;

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  return <StreamPlayer {...props} />;
};

export default VideoPlayer;
