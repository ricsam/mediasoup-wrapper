import { RtpCodecCapability, TransportListenIp, WorkerLogTag } from 'mediasoup/node/lib/types';

const listenIps = [
  {
    ip: process.env.WEBRTC_LISTEN_IP || '127.0.0.1',
    announcedIp: process.env.WEBRTC_ANNOUNCED_IP || undefined
  }
] as TransportListenIp[];
if (process.env.NODE_ENV === 'development') {
  listenIps.push({ ip: '192.168.1.9', announcedIp: undefined });
}
// { ip: "192.168.1.9", announcedIp: null },
// { ip: '10.10.23.101', announcedIp: null },

export const config = {
  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'debug',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp'
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ] as WorkerLogTag[]
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        }
      ] as RtpCodecCapability[]
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on localhost
    webRtcTransport: {
      listenIps,
      initialAvailableOutgoingBitrate: 800000
    }
  }
} as const;
