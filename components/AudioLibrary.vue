<template>
    <div class="artist-list">
        <h1>🎧 Artist Library</h1>

        <h1 class="text-3xl font-bold underline">    Hello world!  </h1>

        <ul>
            <li
                v-for="(artist, index) in artists"
                :key="index"
                @click="selectArtist(index)"
                class="artist-link"
            >
                {{ artist.name }}
            </li>
        </ul>

        <div v-if="selectedArtist">
            <h2>{{ selectedArtist.name }}'s Songs</h2>

            <div
                v-for="(audio, index) in selectedArtist.audios"
                :key="index"
                class="eventContent__audio"
                :ref="el => setSongRef(el, index)"
            >
                <!-- Top Row: Button + Info + Duration -->
                <div class="audio-info-row">
                    <!-- Play/Pause Button -->
                    <button class="play-button" @click="togglePlay(index)">
                        <Icon
                            :name="currentAudioIndex === index && isPlaying ? 'material-symbols:pause' : 'material-symbols:play-arrow'"
                            size="24"
                        />
                    </button>


                    <!-- Song Info -->
                    <div class="audio-meta">
                        <div class="audio-title">{{ audio.title }}</div>
                        <div class="audio-author">{{ audio.author }}</div>
                    </div>

                    <!-- Duration -->
                    <div class="audio-duration">
                        {{ audio.durationText }}
                    </div>
                </div>

                <!-- Progress Bar -->
                <div
                    class="timeline-bar"
                    @click="currentAudioIndex === index && isPlaying ? seek(index, $event) : null"
                >
                    <div
                        class="timeline-progress"
                                        :style="{
                        width: `${progress[index] || 0}%`,
                        opacity: currentAudioIndex === index ? 1 : 0.3
                      }"
                    ></div>
                </div>

                <audio
                    ref="audio"
                    :src="audio.src"
                    @ended="onEnded"
                    @timeupdate="updateProgress(index)"
                />
            </div>

        </div>
        <!-- Fixed Bottom Player Bar -->
        <div v-if="selectedArtist && currentAudioIndex !== null"
             class="player-bar"
             :style="{ backgroundImage: `url(${playerBg.value})` }">
<!--            {{playerBg}}-->
            <div class="player-bar-overlay"></div>

            <!-- MOBILE ONLY Meta + Timeline (above controls) -->
            <div class="mobile-meta-timeline" v-if="selectedArtist && currentAudioIndex !== null">
                <div class="player-meta">
                    <div class="meta-title">
                        {{ selectedArtist.audios[currentAudioIndex].title }}
                    </div>
                    <div class="meta-artist">
                        {{ selectedArtist.audios[currentAudioIndex].author }}
                    </div>
                </div>
                <div
                    class="timeline-bar"
                    @click="isPlaying ? seek(currentAudioIndex, $event) : null"
                >
                    <div
                        class="timeline-progress"
                        :style="{
                                width: `${progress[currentAudioIndex] || 0}%`,
                                opacity: 1
                              }"
                    ></div>
                </div>
            </div>


            <!-- Cover + Metadata Block -->
            <div class="player-info" :class="{ 'visible': !isCurrentSongVisible }">
                <img
                    class="player-cover-image"
                    :src="getImageUrlFromAudioSrc(selectedArtist.audios[currentAudioIndex].src)"
                    alt="Cover"
                    @error="handleImageError"
                />
                <div class="player-meta">
                    <div class="meta-title">{{ selectedArtist.audios[currentAudioIndex].title }}</div>
                    <div class="meta-artist">{{ selectedArtist.audios[currentAudioIndex].author }}</div>
                </div>
            </div>

            <!-- Controls -->
            <div
                class="controls"
                :class="{ 'shifted': !isCurrentSongVisible }"
            >
                <button @click="prevSong">
                    <Icon name="material-symbols:skip-previous-rounded" size="28" />
                </button>

                <button @click="seekRelative(-10)">
                    <Icon name="material-symbols:replay-10-rounded" size="28" />
                </button>

                <button class="main-play-btn" @click="togglePlay(currentAudioIndex)">
                    <Icon
                        :name="isPlaying ? 'material-symbols:pause-circle-rounded' : 'material-symbols:play-circle-rounded'"
                        size="44"
                    />
                </button>

                <button @click="seekRelative(10)">
                    <Icon name="material-symbols:forward-10-rounded" size="28" />
                </button>

                <button @click="nextSong">
                    <Icon name="material-symbols:skip-next-rounded" size="28" />
                </button>
            </div>

            <div class="space"></div>
        </div>




    </div>
</template>

<script setup>
import {onMounted, onUnmounted, watch, ref, nextTick, computed  } from 'vue'
import * as Arobi from '~/data/audios.js'
import * as Iska from '~/data/audiosIska.js'
import * as SykeIska from '~/data/audiosSykeIska.js'
import * as Zumer from '~/data/audiosZumer.js'
import { parseBlob } from 'music-metadata'

function shuffleArray(arr) {
    const array = [...arr]
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

const artists = ref([
    { name: Arobi.artist, audios: shuffleArray(Arobi.audios) },
    { name: Iska.artist, audios: shuffleArray(Iska.audios) },
    { name: SykeIska.artist, audios: shuffleArray(SykeIska.audios) },
    { name: Zumer.artist, audios: shuffleArray(Zumer.audios) },
])

const selectedArtist = ref(null)
const audioRefs = ref([])
const currentAudioIndex = ref(null)
const isPlaying = ref(false)
const copiedIndex = ref(null)
const isCurrentSongVisible = ref(true)
const songRefs = ref([])
const coverImages = ref({})
const progress = ref([])
const fallbackImage = 'https://picsum.photos/seed/picsum/200/300'
function updateProgress(index) {
    const audio = audioRefs.value[index]
    if (audio && audio.duration) {
        progress.value[index] = (audio.currentTime / audio.duration) * 100
    }
}

function seek(index, event) {
    const audio = audioRefs.value[index]
    if (!audio) return

    const bar = event.currentTarget
    const clickX = event.offsetX
    const barWidth = bar.clientWidth
    const newTime = (clickX / barWidth) * audio.duration
    audio.currentTime = newTime
}


function selectArtist(index) {
    selectedArtist.value = artists.value[index]
    currentAudioIndex.value = null
    isPlaying.value = false

    nextTick(() => {
        audioRefs.value = document.querySelectorAll('audio')
        progress.value = selectedArtist.value.audios.map(() => 0)
    })

    copiedIndex.value = null
}

const playerBg = computed(() => {
    if (!selectedArtist.value || currentAudioIndex.value === null) return fallbackImage

    const img = getImageUrlFromAudioSrc(selectedArtist.value.audios[currentAudioIndex.value].src)
    // Just return fallback if img is falsy
    return img || fallbackImage
})


async function togglePlay(index) {
    await nextTick()
    const selectedAudio = audioRefs.value[index]
    if (!selectedAudio) return

    if (currentAudioIndex.value !== null && currentAudioIndex.value !== index) {
        const currentAudio = audioRefs.value[currentAudioIndex.value]
        if (currentAudio) {
            currentAudio.pause()
            currentAudio.currentTime = 0
        }
    }

    if (currentAudioIndex.value === index && isPlaying.value) {
        selectedAudio.pause()
        isPlaying.value = false
    } else {
        selectedAudio.play()
        currentAudioIndex.value = index
        isPlaying.value = true
    }
}

function onEnded() {
    const currentIndex = currentAudioIndex.value

    // Check if there is a next song
    if (
        currentIndex !== null &&
        selectedArtist.value &&
        currentIndex + 1 < selectedArtist.value.audios.length
    ) {
        const nextIndex = currentIndex + 1
        currentAudioIndex.value = nextIndex
        isPlaying.value = true

        nextTick(() => {
            const nextAudio = audioRefs.value[nextIndex]
            if (nextAudio) {
                nextAudio.play()
            }
        })
    } else {
        // End of playlist
        isPlaying.value = false
        currentAudioIndex.value = null
    }
}


function seekRelative(seconds) {
    const current = audioRefs.value[currentAudioIndex.value]
    if (current) {
        current.currentTime = Math.min(
            Math.max(current.currentTime + seconds, 0),
            current.duration
        )
    }
}

function nextSong() {
    const next = currentAudioIndex.value + 1
    if (
        selectedArtist.value &&
        next < selectedArtist.value.audios.length
    ) {
        togglePlay(next)
    }
}

function prevSong() {
    const prev = currentAudioIndex.value - 1
    if (prev >= 0) {
        togglePlay(prev)
    }
}


function checkIfCurrentSongVisible() {
    if (currentAudioIndex.value === null) {
        isCurrentSongVisible.value = true
        return
    }

    const songEl = songRefs.value[currentAudioIndex.value]

    if (!songEl) {
        isCurrentSongVisible.value = true
        return
    }

    const rect = songEl.getBoundingClientRect()
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
    isCurrentSongVisible.value = isVisible
}

async function loadCoverImageFromMP3(audioUrl, index) {
    try {
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })

        const metadata = await parseBlob(blob)

        const picture = metadata?.common?.picture?.[0]
        if (picture) {
            const base64String = btoa(
                String.fromCharCode(...new Uint8Array(picture.data))
            )
            const imageUrl = `data:${picture.format};base64,${base64String}`
            coverImages.value[index] = imageUrl
        } else {
            // No cover found, optional: set a fallback or skip
            console.warn(`No cover found for index ${index}`)
        }
    } catch (error) {
        console.error('Error extracting cover art:', error)
    }
}


onMounted(() => {
    window.addEventListener('scroll', checkIfCurrentSongVisible)
})

onUnmounted(() => {
    window.removeEventListener('scroll', checkIfCurrentSongVisible)
})

const playerBgUrl = ref(fallbackImage)

watch([selectedArtist, currentAudioIndex], async () => {
    if (!selectedArtist.value || currentAudioIndex.value === null) {
        playerBgUrl.value = fallbackImage
        return
    }

    const url = getImageUrlFromAudioSrc(selectedArtist.value.audios[currentAudioIndex.value].src)

    // Preload image
    const img = new Image()
    img.src = url
    img.onload = () => playerBgUrl.value = url
    img.onerror = () => playerBgUrl.value = fallbackImage
})





function setSongRef(el, index) {
    if (el) {
        songRefs.value[index] = el
    }
}


function copySrc(src, index) {
    navigator.clipboard.writeText(src).then(() => {
        copiedIndex.value = index
    }).catch(() => {})
}



function getImageUrlFromAudioSrc(audioSrc) {
    if (!audioSrc) return ''
    return audioSrc.replace('/songs/', '/images/').replace('.mp3', '.jpg')
}

function handleImageError(event) {
    event.target.src = fallbackImage
}



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

/* Player bar (fixed) */

.player-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    z-index: 999;
    background-size: cover;
    background-position: center;
    overflow: hidden;
}

.player-bar-overlay {
    position: absolute;
    inset: 0;
    backdrop-filter: blur(2px);
    background: rgba(0,0,0,0.5);
    z-index: -1; /* <- move behind .player-bar content */
}



/* Player info (cover + meta) */
.player-info {
    display: flex;
    align-items: center;
    margin-right: auto;
    opacity: 0;
    transform: translateX(-20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
}
.player-info.visible {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
}
.player-cover-image {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 10px;
}
.player-meta {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.meta-title {
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: white;
}
.meta-artist {
    font-size: 0.8rem;
    color: #ccc;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
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
    color: white;
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
    .player-info {
        display: none; /* hide cover + metadata */
    }

    .space {
        display: none; /* remove spacing helper */
    }

    .player-bar {
        flex-direction: column;   /* stack vertically */
        align-items: center;
        justify-content: flex-start;
        height: auto;             /* grow as needed */
        padding: 8px 0;
    }

    .mobile-meta-timeline {
        order: -1;                /* force above controls */
        width: 100%;
        margin-bottom: 6px;
    }

    .controls {
        position: relative;       /* remove absolute overlap */
        left: auto;
        transform: none;
        margin: 0 auto;
        gap: 10px;
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

