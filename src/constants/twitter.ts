export namespace twitter_constants {
  export const HMDNY_TWITTER_HANDLE: string = 'HowsMyDrivingNY';
  export const MAX_TWITTER_STATUS_LENGTH: number = 280;
  export const TWITTER_TIME_FORMAT: string = '%a %b %d %H:%M:%S %z %Y';

  export enum TwitterAPIAttribute {
    DIRECT_MESSAGE = 'direct_message',
    ENTITIES = 'entities',
    EXTENDED_TWEET = 'extended_tweet',
    EVENT_TYPE = 'event_type',
    FULL_TEXT = 'full_text',
    MESSAGE_CREATE = 'message_create',
    RETWEETED_STATUS = 'retweeted_status'
  }

  export enum TwitterMessageType {
    DIRECT_MESSAGE = 'direct_message',
    STATUS = 'status'
  }
}
