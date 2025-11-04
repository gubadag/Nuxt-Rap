<script setup lang="ts">
import PauseIcon from "~/components/PauseIcon.vue";
import PlayIcon from "~/components/PlayIcon.vue";
import Rewind10Icon from "~/components/Rewind10Icon.vue";
import Forward10Icon from "~/components/Forward10Icon.vue";
import PrevSongIcon from "~/components/PrevSongIcon.vue";
import NextSongIcon from "~/components/NextSongIcon.vue";

defineProps<{ size?: number | string }>()
</script>

<template>
  <div class="controls">

    <button @click="prevSong"><PrevSongIcon size="28" /></button>
    <!--        <button @click="prevSong"><Icon name="material-symbols:skip-previous-rounded" size="28" /></button>-->
    <button @click="seekRelative(-10)">
      <Rewind10Icon size="28" />
    </button>

    <button class="main-play-btn" @click="togglePlay(currentArtistIndex, currentAudioIndex)">
      <component :is="isPlaying ? PauseIcon : PlayIcon" size="44" />
    </button>

    <button @click="seekRelative(10)">
      <Forward10Icon size="28" />
    </button>

    <!--        <button @click="seekRelative(-10)"><Icon name="material-symbols:replay-10-rounded" size="28" /></button>-->
    <!--        <button class="main-play-btn" @click="togglePlay(currentArtistIndex, currentAudioIndex)">-->
    <!--          <Icon-->
    <!--              :name="isPlaying ? 'material-symbols:pause-circle-rounded' : 'material-symbols:play-circle-rounded'"-->
    <!--              size="44"-->
    <!--          />-->
    <!--        </button>-->
    <!--        <button @click="seekRelative(10)"><Icon name="material-symbols:forward-10-rounded" size="28" /></button>-->
    <!--        <button @click="nextSong"><Icon name="material-symbols:skip-next-rounded" size="28" /></button>-->
    <button @click="nextSong"><NextSongIcon size="28" /></button>
  </div>
  <div class="controls">

    <button @click="prevSong"><Icon name="material-symbols:skip-previous-rounded" size="28" /></button>

    <button @click="seekRelative(-10)"><Icon name="material-symbols:replay-10-rounded" size="28" /></button>

    <button class="main-play-btn" @click="togglePlay(currentArtistIndex, currentAudioIndex)">
      <Icon
          :name="isPlaying ? 'material-symbols:pause-circle-rounded' : 'material-symbols:play-circle-rounded'"
          size="44"
      />
    </button>

    <button @click="seekRelative(10)"><Icon name="material-symbols:forward-10-rounded" size="28" /></button>

    <button @click="nextSong"><Icon name="material-symbols:skip-next-rounded" size="28" /></button>
  </div>


</template>
