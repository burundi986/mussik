import { cn } from '../../utils/helpers'

export function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
  const icons = {
    search: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    close: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>`,
    chevronDown: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>`,
    chevronRight: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>`,
    menu: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`,
    settings: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
    library: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
    music: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    playlist: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    download: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    heart: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    play: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>`,
    pause: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    volume: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`,
    more: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    shuffle: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`,
    repeat: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
    skipBack: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" strokeWidth="2"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
    skipForward: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" strokeWidth="2"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    volumeMute: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    heartFilled: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
    mail: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>`,
    lock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    alert: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    logOut: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  }

  return (
    <span
      className={cn('icon', className)}
      dangerouslySetInnerHTML={{ __html: icons[name] || '' }}
    />
  )
}

export function MusicNoteIcon({ size = 20, className = '' }) {
  return (
    <span className={cn('icon', className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    </span>
  )
}
