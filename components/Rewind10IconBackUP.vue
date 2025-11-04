<template>
  <div class="artist-page">
    <!-- Sidebar with artists -->
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

      <!-- Songs for selected artist -->
      <div
          v-for="(artist, artistIndex) in artists"
          :key="'artist-' + artistIndex"
          class="artist-songs"
          v-show="selectedArtistIndex === artistIndex"
      >
        <h2>{{ artist.name }}'s Songs</h2>

        <div
            v-for="(audio, index) in artist.audios"
            :key="'audio-' + artistIndex + '-' + index"
            class="eventContent__audio"
            :ref="el => setSongRef(el, artistIndex, index)"
        >
          <!-- existing audio row & timeline here -->
          <!-- ... your same play button and audio meta ... -->
        </div>
      </div>
    </div>

    <!-- keep your bottom player -->
    <!-- (no change to your player-bar or logic) -->
  </div>
</template>
