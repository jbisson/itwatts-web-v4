<script setup lang="ts">
import type { LeaderType, TemplateType, ThemeFeatures, PackageType, FooterType, Feature } from '@/types/components/front-pages/index';
import {
    WandIcon,
    ShieldLockIcon,
    ArchiveIcon,
    AdjustmentsIcon,
    TagIcon,
    DiamondIcon,
    DatabaseIcon,
    LanguageKatakanaIcon,
    BuildingCarouselIcon,
    ArrowsShuffleIcon,
    ChartPieIcon,
    LayersIntersectIcon,
    RefreshIcon,
    BookIcon,
    CalendarIcon,
    MessageIcon,
    CircleCheckIcon,
    CircleXIcon
} from 'vue-tabler-icons';
const ThemeFeature1: ThemeFeatures[] = [
    {
        icon: WandIcon,
        title: 'KOM',
        color: 'primary'
    },
    {
        icon: ShieldLockIcon,
        title: 'Segment',
        color: 'secondary'
    },
    {
        icon: ArchiveIcon,
        title: 'Power Curve',
        color: 'error'
    },
    {
        icon: AdjustmentsIcon,
        title: 'Watts',
        color: 'success'
    },
    {
        icon: TagIcon,
        title: 'Relative Effort',
        color: 'info'
    },
    {
        icon: DiamondIcon,
        title: 'Zone distribution',
        color: 'warning'
    }
];
const ThemeFeature2: ThemeFeatures[] = [
    {
        icon: DatabaseIcon,
        title: 'Integrity',
        color: 'success'
    },
    {
        icon: LanguageKatakanaIcon,
        title: 'Respect',
        color: 'error'
    },
    {
        icon: BuildingCarouselIcon,
        title: 'Sportsmanship',
        color: 'warning'
    },
    {
        icon: ArrowsShuffleIcon,
        title: 'Discipline',
        color: 'primary'
    }
];
const ThemeFeature3: ThemeFeatures[] = [
    {
        icon: ChartPieIcon,
        title: '5.W.4.T',
        color: 'secondary'
    },
];


</script>

<template>
    <div class="pt-96 bg-surface">
        <v-container class="max-width-1218 overflow-hidden">
            <div class="d-flex ga-6 marquee1-group">
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature1" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature1" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature1" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
            </div>
            <div class="d-flex ga-6 marquee2-group pt-6">
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature2" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature2" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature2" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature2" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
            </div><!--
            <div class="d-flex ga-6 marquee1-group pt-6">
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature3" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature3" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
                <div class="flex-grow-0 flex-shrink-0" v-for="item in ThemeFeature3" :key="item.title">
                    <v-card
                        elevation="0"
                        class="d-flex align-center justify-center py-5 px-8 ga-3 rounded-16"
                        :class="'bg-light' + item.color"
                    >
                        <component :is="item.icon" stroke-width="1.5" :class="'text-' + item.color" size="24" />
                        <h5 :class="'text-15  font-weight-semibold text-' + item.color">{{ item.title }}</h5>
                    </v-card>
                </div>
            </div>-->
        </v-container>
    </div>
</template>
