import React, { useState, useEffect, useRef } from 'react';
import { Envelope3D } from './components/Envelope3D';
import { HeroVideo } from './components/HeroVideo';
import { InvitationText } from './components/InvitationText';
import { Timeline } from './components/Timeline';
import { Organizers } from './components/Organizers';
import { LocationCard } from './components/LocationCard';
import { CountdownTimer } from './components/CountdownTimer';
import { ContactSection } from './components/ContactSection';
import { RSVPForm } from './components/RSVPForm';
import { FooterAndMusic } from './components/FooterAndMusic';
import { AdminRSVPModal } from './components/AdminRSVPModal';
import { RSVPResponse } from './types';
import { RomanticMusicPlayer } from './utils/audio';

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('Alex Warren - Ordinary');
  const [rsvps, setRsvps] = useState<RSVPResponse[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const musicPlayerRef = useRef<RomanticMusicPlayer | null>(null);

  useEffect(() => {
    musicPlayerRef.current = new RomanticMusicPlayer();
    setCurrentTrackName(musicPlayerRef.current.getCurrentTrackName());

    // Load RSVPs from local storage
    const saved = localStorage.getItem('wedding_rsvps');
    if (saved) {
      try {
        setRsvps(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved RSVPs', e);
      }
    }
  }, []);

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
    // Auto start romantic background music upon opening envelope
    if (musicPlayerRef.current && !isMusicPlaying) {
      musicPlayerRef.current.start();
      setIsMusicPlaying(true);
    }
  };

  const handleToggleMusic = () => {
    if (!musicPlayerRef.current) return;

    if (isMusicPlaying) {
      musicPlayerRef.current.stop();
      setIsMusicPlaying(false);
    } else {
      musicPlayerRef.current.start();
      setIsMusicPlaying(true);
    }
  };

  const handleUploadAudio = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl && musicPlayerRef.current) {
        musicPlayerRef.current.setCustomAudio(dataUrl, file.name);
        setCurrentTrackName(file.name);
        setIsMusicPlaying(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetAudioUrl = (url: string) => {
    if (!musicPlayerRef.current) return;
    const trackName = url.split('/').pop() || 'Интернет ыры';
    musicPlayerRef.current.setCustomAudio(url, trackName);
    setCurrentTrackName(trackName);
    setIsMusicPlaying(true);
  };

  const handleResetAudio = () => {
    if (!musicPlayerRef.current) return;
    musicPlayerRef.current.resetToDefault();
    setCurrentTrackName(musicPlayerRef.current.getCurrentTrackName());
    setIsMusicPlaying(true);
  };

  const handleRSVPSubmitted = (newRSVP: RSVPResponse) => {
    setRsvps((prev) => [newRSVP, ...prev]);
  };

  const handleClearRSVPs = () => {
    localStorage.removeItem('wedding_rsvps');
    setRsvps([]);
  };

  return (
    <div className="min-h-screen bg-[#2D0B13] text-[#4A1521] font-serif-title antialiased selection:bg-[#8B1E3F] selection:text-white flex flex-col justify-between">
      {/* 3D Envelope Intro Screen */}
      {!isEnvelopeOpen && (
        <Envelope3D onOpen={handleOpenEnvelope} isOpen={isEnvelopeOpen} />
      )}

      {/* Main Wedding Invitation Page */}
      {isEnvelopeOpen && (
        <div className="w-full max-w-md mx-auto bg-[#2D0B13] shadow-2xl overflow-hidden min-h-screen flex flex-col justify-between animate-fadeIn transition-opacity duration-1000">
          {/* Main Content Container */}
          <main className="w-full space-y-4">
            {/* Block 1 & 2: Hero Video & Names */}
            <HeroVideo
              isMusicPlaying={isMusicPlaying}
              onToggleMusic={handleToggleMusic}
            />

            {/* Block 2: Invitation Text */}
            <InvitationText />

            {/* Block 3: Interactive Program Timeline */}
            <Timeline />

            {/* Block 4: Organizers (Той ээлери) */}
            <Organizers />

            {/* Block 5: Location & Restaurant Card */}
            <LocationCard />

            {/* Block 6: Countdown Timer */}
            <CountdownTimer />

            {/* Block 7: Contact Organizers (WhatsApp) */}
            <ContactSection />

            {/* Block 8: RSVP Form (Анкета) */}
            <RSVPForm onRSVPSubmitted={handleRSVPSubmitted} />
          </main>

          {/* Block 9: Footer & Music Customizer */}
          <FooterAndMusic
            isMusicPlaying={isMusicPlaying}
            currentTrackName={currentTrackName}
            onToggleMusic={handleToggleMusic}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onUploadAudio={handleUploadAudio}
            onSetAudioUrl={handleSetAudioUrl}
            onResetAudio={handleResetAudio}
          />
        </div>
      )}

      {/* Admin RSVP Responses Modal for Hosts */}
      {isAdminOpen && (
        <AdminRSVPModal
          rsvps={rsvps}
          onClose={() => setIsAdminOpen(false)}
          onClear={handleClearRSVPs}
        />
      )}
    </div>
  );
}
