import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { Sliders } from 'lucide-react';

const PRESETS = {
  Flat: [0, 0, 0, 0, 0],
  Rock: [4, 2, -1, 3, 5],
  Pop: [-2, 1, 3, 2, -1],
  Jazz: [3, 2, 1, -2, 2],
  Classical: [5, 3, -1, 2, 4],
};

export const Equalizer: React.FC = () => {
  const { equalizerBands, changeEqGain } = useAudio();

  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const gains = PRESETS[presetName];
    gains.forEach((gain, idx) => {
      changeEqGain(idx, gain);
    });
  };

  const getBandLabel = (freq: number) => {
    if (freq >= 1000) {
      return `${freq / 1000}kHz`;
    }
    return `${freq}Hz`;
  };

  return (
    <div
      className="glass-panel fade-in"
      style={{
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sliders size={20} color="var(--accent)" />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          5-Band Audio Equalizer
        </h3>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((preset) => (
          <button
            key={preset}
            onClick={() => applyPreset(preset)}
            style={{
              flex: 1,
              minWidth: '70px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--panel-border)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* EQ Sliders */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          gap: '12px'
        }}
      >
        {equalizerBands.map((band, idx) => (
          <div
            key={band.frequency}
            className="eq-slider"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* Gain label */}
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                width: '40px',
                textAlign: 'center'
              }}
            >
              {band.gain > 0 ? `+${band.gain}` : band.gain}dB
            </span>

            {/* Slider */}
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={band.gain}
              onChange={(e) => changeEqGain(idx, parseInt(e.target.value))}
              style={{
                writingMode: 'vertical-lr',
                WebkitAppearance: 'slider-vertical',
                width: '12px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.1)',
                outline: 'none',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            />

            {/* Frequency label */}
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}
            >
              {getBandLabel(band.frequency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Equalizer;
