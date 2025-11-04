<template>
  <div class="artist-page">
    <aside class="artist-sidebar" v-if="selectedArtistIndex !== null">
      <h2>🎧 Artists</h2>
      <ul>
        <li
            v-for="(artist, index) in artists"
            :key="index"
            @click="selectArtist(index)"
            class="artist-link"
            :class="{ active: selectedArtistIndex === index }"
        >
          {{ artist.name }}
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <div class="artist-main">
      <h1 v-if="selectedArtistIndex === null">🎧 Artist Library</h1>

      <!-- Initial list (before selecting) -->
      <ul v-if="selectedArtistIndex === null">
        <li
            v-for="(artist, index) in artists"
            :key="index"
            @click="selectArtist(index)"
            class="artist-link"
            :class="{ active: selectedArtistIndex === index }"
        >
          {{ artist.name }}
        </li>
      </ul>


    <!-- All artists' songs pre-rendered but hidden visually -->
    <div
        v-for="(artist, artistIndex) in artists"
        :key="'artist-' + artistIndex"
        class="artist-songs"
        :style="{ display: selectedArtistIndex === artistIndex ? 'block' : 'none' }"
    >
      <h2>{{ artist.name }}'s Songs</h2>

      <div
          v-for="(audio, index) in artist.audios"
          :key="'audio-' + artistIndex + '-' + index"
          class="eventContent__audio"
          :ref="el => setSongRef(el, artistIndex, index)"
      >
        <div class="audio-info-row">
          <button class="play-button" @click="togglePlay(artistIndex, index)">
            <!-- Pause Icon -->
            <svg
                v-if="isPlaying && currentArtistIndex === artistIndex && currentAudioIndex === index"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
              <path d="M14 19V5h4v14zm-8 0V5h4v14z"/>
            </svg>

            <!-- Play Icon -->
            <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
              <path d="M8 19V5l11 7z"/>
            </svg>
          </button>


          <div class="audio-meta">
            <div class="audio-title">{{ audio.title }}</div>
            <div class="audio-author">{{ audio.author }}</div>
          </div>

          <div class="audio-duration">{{ audio.durationText }}</div>
        </div>

        <div
            class="timeline-bar"
            @click="isPlaying && currentArtistIndex === artistIndex && currentAudioIndex === index ? seek(artistIndex, index, $event) : null"
        >
          <div
              class="timeline-progress"
              :style="{
              width: `${progress[artistIndex]?.[index] || 0}%`,
              opacity: currentAudioIndex === index && currentArtistIndex === artistIndex ? 1 : 0.3
            }"
          ></div>
        </div>

        <audio
            :ref="el => setAudioRef(el, artistIndex, index)"
            preload="none"
            :src="audio.src"
            @ended="onEnded"
            @timeupdate="updateProgress(artistIndex, index)"
        />
      </div>
    </div>



    <!-- Fixed Bottom Player -->
    <div v-if="currentArtistIndex !== null && currentAudioIndex !== null" class="player-bar">
      <div class="player-bar-overlay"></div>

      <!-- Player cover + metadata -->
      <div class="player-info" :class="{ hidden: !isCurrentSongVisible }">
        <img
            class="player-cover-image"
            :src="getImageUrlFromAudioSrc(artists[currentArtistIndex].audios[currentAudioIndex].src)"
            alt="Cover"
            @error="handleImageError"
        />
        <div class="player-meta">
          <strong>{{ artists[currentArtistIndex].audios[currentAudioIndex].title }}</strong>
          <div>{{ artists[currentArtistIndex].audios[currentAudioIndex].author }}</div>
        </div>
      </div>

      <!-- Mobile meta + timeline -->
      <div class="mobile-meta-timeline">
        <div class="player-meta">
          <strong class="meta-title">{{ artists[currentArtistIndex].audios[currentAudioIndex].title }}</strong>
          <div class="meta-artist">{{ artists[currentArtistIndex].audios[currentAudioIndex].author }}</div>
        </div>
        <div class="timeline-bar" @click="seek(currentArtistIndex, currentAudioIndex, $event)">
          <div
              class="timeline-progress"
              :style="{ width: `${progress[currentArtistIndex]?.[currentAudioIndex] || 0}%` }"
          ></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls" :class="{ 'shifted': !isCurrentSongVisible }">
        <button @click="prevSong"><PrevSongIcon /></button>
        <button @click="seekRelative(-10)"><Rewind10Icon /></button>
        <button class="main-play-btn" @click="togglePlay(currentArtistIndex, currentAudioIndex)">
          <component :is="isPlaying ? PauseIcon : PlayIcon" size="44" />
        </button>
        <button @click="seekRelative(10)"><Forward10Icon /></button>
        <button @click="nextSong"><NextSongIcon /></button>
      </div>
    </div>
    <!-- Gradient Transparent Overlay Above Player -->
    <div v-if="currentArtistIndex !== null && currentAudioIndex !== null" class="player-bar-second">
      <div class="player-bar-overlay-second"></div>
    </div>

    </div>></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as Arobi from '~/data/audios.js'
import * as Iska from '~/data/audiosIska.js'
import * as SykeIska from '~/data/audiosSykeIska.js'
import * as Zumer from '~/data/audiosZumer.js'
import PlayIcon from '~/components/PlayIcon.vue'
import PauseIcon from '~/components/PauseIcon.vue'
import Forward10Icon from '~/components/Forward10Icon.vue'
import Rewind10Icon from '~/components/Rewind10Icon.vue'
import NextSongIcon from '~/components/NextSongIcon.vue'
import PrevSongIcon from '~/components/PrevSongIcon.vue'



/* --- Reactive State --- */
const artists = ref([
  { name: Arobi.artist, audios:  Arobi.audios },
  { name: Iska.artist, audios:  Iska.audios },
  { name: SykeIska.artist, audios:  SykeIska.audios },
  { name: Zumer.artist, audios:  Zumer.audios },
])

const selectedArtistIndex = ref(null)
const currentArtistIndex = ref(null)
const currentAudioIndex = ref(null)
const isPlaying = ref(false)
const progress = ref([])
const audioRefs = ref({})
const songRefs = ref({})
const isCurrentSongVisible = ref(false)
const fallbackImage = 'https://picsum.photos/seed/picsum/200/300'
const playerBgUrl = ref(fallbackImage)
/* --- Artist Selection --- */
function selectArtist(index) {
  selectedArtistIndex.value = index
  currentAudioIndex.value = null
  isPlaying.value = false
  nextTick(() => {
    if (!progress.value[index]) progress.value[index] = artists.value[index].audios.map(() => 0)
  })
}

/* --- Audio Controls --- */
function setAudioRef(el, artistIndex, audioIndex) {
  if (!audioRefs.value[artistIndex]) audioRefs.value[artistIndex] = []
  audioRefs.value[artistIndex][audioIndex] = el
}

function setSongRef(el, artistIndex, audioIndex) {
  if (!songRefs.value[artistIndex]) songRefs.value[artistIndex] = []
  songRefs.value[artistIndex][audioIndex] = el
}

function togglePlay(artistIndex, audioIndex) {
  const audio = audioRefs.value[artistIndex]?.[audioIndex]
  if (!audio) return

  // If it's the currently playing one → just toggle play/pause
  if (
      currentArtistIndex.value === artistIndex &&
      currentAudioIndex.value === audioIndex
  ) {
    if (isPlaying.value) {
      audio.pause()
      isPlaying.value = false
    } else {
      audio.play().catch(err => console.warn('Playback failed:', err))
      isPlaying.value = true
    }
    return
  }

  // Otherwise, stop everything else (reset their times)
  pauseAllAudios(true)

  // Start the new one from beginning
  audio.currentTime = 0
  audio.play().catch(err => console.warn('Playback failed:', err))
  isPlaying.value = true
  currentArtistIndex.value = artistIndex
  currentAudioIndex.value = audioIndex
}

function pauseAllAudios(reset = false) {
  for (const artistList of Object.values(audioRefs.value)) {
    for (const audio of artistList || []) {
      if (audio && !audio.paused) {
        audio.pause()
        if (reset) audio.currentTime = 0
      }
    }
  }
}


function handleImageError(event) {
  event.target.src = fallbackImage
}

function checkIfCurrentSongVisible() {
  if (currentAudioIndex.value === null || currentArtistIndex.value === null) {
    isCurrentSongVisible.value = true // show metadata if no song is selected
    return
  }

  const songEl = songRefs.value[currentArtistIndex.value]?.[currentAudioIndex.value]
  if (!songEl) {
    isCurrentSongVisible.value = true // show metadata if element missing
    return
  }

  const rect = songEl.getBoundingClientRect()
  const isVisible = rect.bottom > 0 && rect.top < window.innerHeight
  isCurrentSongVisible.value = !isVisible
}




function updateProgress(artistIndex, audioIndex) {
  const audio = audioRefs.value[artistIndex]?.[audioIndex]
  if (audio && audio.duration) {
    if (!progress.value[artistIndex]) progress.value[artistIndex] = []
    progress.value[artistIndex][audioIndex] = (audio.currentTime / audio.duration) * 100
  }
}

function seek(artistIndex, audioIndex, event) {
  const audio = audioRefs.value[artistIndex]?.[audioIndex]
  if (!audio) return
  const bar = event.currentTarget
  const clickX = event.offsetX
  const newTime = (clickX / bar.clientWidth) * audio.duration
  audio.currentTime = newTime
}

function onEnded() {
  nextSong()
}

function nextSong() {
  if (currentArtistIndex.value === null || currentAudioIndex.value === null) return
  const nextIndex = currentAudioIndex.value + 1
  const audios = artists.value[currentArtistIndex.value].audios
  if (nextIndex < audios.length) {
    togglePlay(currentArtistIndex.value, nextIndex)
  } else {
    isPlaying.value = false
  }
}

function prevSong() {
  if (currentArtistIndex.value === null || currentAudioIndex.value === null) return
  const prevIndex = currentAudioIndex.value - 1
  if (prevIndex >= 0) {
    togglePlay(currentArtistIndex.value, prevIndex)
  }
}

function seekRelative(seconds) {
  if (currentArtistIndex.value === null || currentAudioIndex.value === null) return
  const current = audioRefs.value[currentArtistIndex.value]?.[currentAudioIndex.value]
  if (current) {
    current.currentTime = Math.min(Math.max(current.currentTime + seconds, 0), current.duration)
  }
}

function getImageUrlFromAudioSrc(audioSrc) {
  if (!audioSrc) return ''
  return audioSrc.replace('/songs/', '/images/').replace('.mp3', '.jpg')
}


/* --- Player Background --- */
watch([currentArtistIndex, currentAudioIndex], async () => {
  if (currentArtistIndex.value === null || currentAudioIndex.value === null) {
    playerBgUrl.value = fallbackImage
    return
  }

  const currentAudio = artists.value[currentArtistIndex.value].audios[currentAudioIndex.value]
  const url = getImageUrlFromAudioSrc(currentAudio.src)
  const img = new Image()
  img.src = url
  img.onload = () => (playerBgUrl.value = url)
  img.onerror = () => (playerBgUrl.value = fallbackImage)
})

/* --- Mount Hooks --- */
onMounted(() => {
  window.addEventListener('scroll', checkIfCurrentSongVisible)
  window.addEventListener('resize', checkIfCurrentSongVisible)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkIfCurrentSongVisible)
  window.removeEventListener('resize', checkIfCurrentSongVisible)
})


</script>

<style scoped>
.artist-page {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Sidebar (shows after selecting artist) */
.artist-sidebar {
  width: 220px;
  background: #f4f6ff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  height: fit-content;
}

.artist-sidebar h2 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  text-align: center;
}

.artist-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.artist-main {
  flex: 1;
}

/* Mobile view: stack sidebar on top */
@media (max-width: 768px) {
  .artist-page {
    flex-direction: column;
  }

  .artist-sidebar {
    width: 100%;
    position: static;
  }
}


.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  z-index: 998; /* stays below the fade */
  background-size: cover;
  background-position: center;
  overflow: hidden;
}


.player-bar-overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(2px);
  background: rgba(0,0,0,0.4);
  z-index: -1; /* <- move behind .player-bar content */
}



/* Player bar (fixed) */

.player-bar-second {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1000;
  pointer-events: none;
}

.player-bar-overlay-second {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background-color: rgba(0, 0, 0, 0.4); /* solid color base */
  opacity: 0.8;

  /* Gradient transparency upward */
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%);
}












.artist-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.artist-link {
  cursor: pointer;
  margin: 0.5rem 0;
  color: #3b82f6;
}

.artist-link.active {
  font-weight: bold;
  color: #1d4ed8;
}

.eventContent__audio {
  margin-bottom: 1rem;
}

.timeline-bar {
  background: #ddd;
  height: 4px;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.timeline-progress {
  height: 100%;
  background: #3b82f6;
  transition: width 0.1s;
}




/* Mobile adjustments */
@media (max-width: 720px) {
  .player-bar {
    flex-direction: column;
    padding: 8px;
  }
}





.artist-list {
    max-width: 1100px;
    margin: 40px auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', sans-serif;
}

/* Title */
.artist-list h1 {
    text-align: center;
    font-size: clamp(1.8rem, 3vw, 2.5rem); /* scales between mobile & desktop */
    margin-bottom: 30px;
    color: #1e1e2f;
}

/* Artist list */
.artist-list ul {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    padding: 0;
    margin: 0 0 30px 0;
    list-style: none;
}

.artist-link {
    flex: 1 1 auto;
    min-width: 140px;
    text-align: center;
    padding: 12px 20px;
    background: #e3e6f3;
    border-radius: 12px;
    font-weight: 600;
    color: #2a2a3b;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.artist-link:hover {
    background: #5561ff;
    color: #fff;
}

/* Song card */
.eventContent__audio {
    background: #fff;
    border: 1px solid #ececec;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease;
}
.eventContent__audio:hover {
    transform: scale(1.01);
}

/* Audio row */
.audio-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap; /* wraps on small screens */
}

.audio-meta {
    flex: 1;
    min-width: 0; /* prevents flex overflow */
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.audio-title {
    font-weight: 600;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.audio-author {
    font-size: 0.85rem;
    color: #666;
}

.audio-duration {
    font-size: 0.9rem;
    color: #444;
    white-space: nowrap;
}

/* Play button */
.play-button {
    flex-shrink: 0;
    font-size: 1.2rem;
    padding: 8px;
    border-radius: 50%;
    background: #5561ff;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.play-button:hover {
    background: #3b44c3;
}

/* Progress bar */
.timeline-bar {
    width: 100%;
    height: 8px;
    background: #ddd;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;
    position: relative;
}
.timeline-progress {
    height: 100%;
    background: #5561ff;
    transition: width 0.1s linear, opacity 0.3s ease;
}




/* Player info (cover + meta) */
.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.player-info.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px); /* subtle move when hidden */
}

.player-cover-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.player-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: white; /* or a light color */
  fill: white;
}

.player-meta strong {
  font-weight: 600;
  color: white;
}

.player-meta div {
  font-size: 0.85rem;
  color: #ccc;
}


/* Player controls */
.controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 0 auto;
    transition: transform 0.4s ease;
}


/* DO NOT DELETE .space THAT HELPS TO CENTER <DIV> */
 .space {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 auto;
    transition: transform 0.4s ease;
}

.controls button {
    background: none;
    border: none;
    cursor: pointer;
    color: white; /* or a light color */
    fill: white;
    transition: transform 0.2s ease;
}
.controls button:hover {
    transform: scale(1.2);
}
.main-play-btn {
    font-size: 1.5rem;
}

/* -------------------
   RESPONSIVENESS
------------------- */

@media (max-width: 720px) {
  /* Show mobile meta above controls */
  .mobile-meta-timeline {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 8px;
    padding: 0 10px;
  }

  .mobile-meta-timeline .meta-title {
    font-weight: bold;
    font-size: 0.95rem;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .mobile-meta-timeline .meta-artist {
    font-size: 0.85rem;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 6px;
  }

  /* Timeline smaller on mobile */
  .mobile-meta-timeline .timeline-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
  }

  .mobile-meta-timeline .timeline-progress {
    background-color: #fff;
  }

  /* Hide desktop player-info on mobile */
  .player-info {
    display: none;
  }

  .player-bar {
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
  }
}






/* Small mobiles */


/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .artist-link {
        flex: 1 1 45%;
    }
}

/* Laptops / Desktops */
@media (min-width: 1025px) {
    .artist-link {
        flex: 1 1 20%;
    }
    .controls {
        margin: 0 auto;
        transform: none !important;
    }
}
/* MOBILE: when cover + metadata hidden, center controls */


.mobile-meta-timeline {
    display: none; /* hide by default */
    flex-direction: column;
    width: 100%;
    padding-bottom: 8px;
    color: white;
}

@media (max-width: 720px) {
    .mobile-meta-timeline {
        display: flex; /* show only on mobile */


    }

    .mobile-meta-timeline .player-meta {
        margin: 6px 10px 0;
        display: flex;
        flex-direction: column;
        padding: 1px 10px;

    }

    .mobile-meta-timeline .meta-title {
        font-weight: bold;
        font-size: 0.95rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 20px;     /* Sets the top margin */
    }

    .mobile-meta-timeline .meta-artist {
        font-size: 0.85rem;
        color: #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

    }

    .mobile-meta-timeline .timeline-bar {
        margin: 6px 10px 0;
        height: 6px;
        background: rgba(255, 255, 255, 0.3);
    }

    .mobile-meta-timeline .timeline-progress {
        background-color: #fff;

    }
}



</style>

