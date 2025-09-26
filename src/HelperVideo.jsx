import { useState } from 'react';


export default function HelperVideo({ src }) {
    const [playing, setPlaying] = useState(true);

    const togglePlay = () => {
        const video = document.getElementById('helper-video');
        if (!video) return;

        if (playing) {
            video.pause();
        } else {
            video.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="fixed bottom-6 right-6 w-64 h-64 rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 z-50">
            <video
                id="helper-video"
                src={src}
                autoPlay
                loop
                className="w-full h-full object-cover"
            />
            <button
                onClick={togglePlay}
                className="absolute bottom-10 right-10 bg-white bg-opacity-70 rounded-full p-1 text-xs"
            >
                {playing ? '❚❚' : '▶'}
            </button>
        </div>
    );
}
