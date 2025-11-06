const MainRoutes = {
    path: '/itwatts',
    meta: {
        requiresAuth: true
    },
    //redirect: '/itwatts/signin',
    //component: () => import('@/layouts/full/FullLayout.vue'),
    component: () => import('@/layouts/full/ItWattsFullLayout.vue'),
    children: [      
      {
        path: '/itwatts/team/swat/admin/clubladder-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/clubLadderRegistrations.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/discord',
        component: () => import('@/views/itwatts/team/swat/admin/discord.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-guests',
        component: () => import('@/views/itwatts/team/swat/admin/swatGuests.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-interest-forms',
        component: () => import('@/views/itwatts/team/swat/admin/swatInterestForms.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-guest-forms',
        component: () => import('@/views/itwatts/team/swat/admin/swatGuestForms.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-members',
        component: () => import('@/views/itwatts/team/swat/admin/swatMembers.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-members-poster',
        component: () => import('@/views/itwatts/team/swat/admin/swatMembersPoster.vue'),
      },      
      {
        path: '/itwatts/team/swat/admin/zrl20252026-round2-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/zrl20252026Round2Registrations.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/swat-academy-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/swatAcademyRegistrations.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/2025poll-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/2025pollRegistrations.vue'),
      },
      {
        path: '/itwatts/team/swat/admin/wtrlttt-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/wtrlTTTRegistrations.vue'),
      },      
      {
        path: '/itwatts/team/swat/admin/zwiftpower',
        component: () => import('@/views/itwatts/team/swat/admin/zwiftpower.vue'),
      },
      {
        path: '/itwatts/atomas/info',
        component: () => import('@/views/itwatts/atomas/info.vue'),
      },
      {
        path: '/itwatts/atomas/results',
        component: () => import('@/views/itwatts/atomas/results.vue'),
      },
      {
        path: '/itwatts/gcqc/info',
        component: () => import('@/views/itwatts/gcqc/info.vue'),
      },
      {
        path: '/itwatts/gcqc/results',
        component: () => import('@/views/itwatts/gcqc/results.vue'),
      },
      {
        path: '/itwatts/gcqc/signups',
        component: () => import('@/views/itwatts/gcqc/signups.vue'),
      },
      {
        path: '/itwatts/team/swat/itt/info',
        component: () => import('@/views/itwatts/team/swat/itt/info.vue'),
      },
      {
        path: '/itwatts/team/swat/itt/results',
        redirect: to => {
          return '/itwatts/team/swat/itt/results/18'
        }
      },
      {
        path: '/itwatts/team/swat/itt/results/:serie',
        component: () => import('@/views/itwatts/team/swat/itt/results.vue'),
      },
      {
        name: 'email',
        path: '/itwatts/email',
        component: () => import('@/views/itwatts/email.vue'),
      },
      {
        name: 'admission',
        path: '/itwatts/team/swat/admission',
        component: () => import('@/views/itwatts/team/swat/admission.vue'),
      },
      {
        name: 'compliance',
        path: '/itwatts/team/swat/compliance',
        component: () => import('@/views/itwatts/team/swat/compliance.vue'),
      },
      {
        name: 'frr',
        path: '/itwatts/team/swat/frr',
        component: () => import('@/views/itwatts/team/swat/frr.vue'),
      },
      {
        name: 'fullcalendar',
        path: '/itwatts/team/swat/fullcalendar',
        component: () => import('@/views/itwatts/team/swat/fullCalendar.vue'),
      },
      {
        name: 'guests',
        path: '/itwatts/team/swat/guests',
        component: () => import('@/views/itwatts/team/swat/guests.vue'),
      },
      {
        name: 'info_swat',
        path: '/itwatts/team/swat/info_swat',
        component: () => import('@/views/itwatts/team/swat/info2.vue'),
      },
      {
        name: 'interest',
        path: '/itwatts/team/swat/interest',
        component: () => import('@/views/itwatts/team/swat/interest.vue'),
      },
      {
        name: 'invite',
        path: '/itwatts/team/swat/invite',
        component: () => import('@/views/itwatts/team/swat/invite.vue'),
      },
      {
        name: 'ircalendar',
        path: '/itwatts/team/swat/irlcalendar',
        component: () => import('@/views/itwatts/team/swat/irlCalendar.vue'),
      },
      {
        name: 'participation',
        path: '/itwatts/team/swat/participation',
        component: () => import('@/views/itwatts/team/swat/participation.vue'),
      },
      {
        name: 'registerClubLadder',
        path: '/itwatts/team/swat/register-clubladder',
        component: () => import('@/views/itwatts/team/swat/registerClubLadder.vue'),
      },
      {
        name: 'swatSubscription2026',
        path: '/itwatts/team/swat/subscription-2026',
        component: () => import('@/views/itwatts/team/swat/subscription2026.vue'),
      },
      {
        name: 'registerZrl',
        path: '/itwatts/team/swat/register-zrl',
        component: () => import('@/views/itwatts/team/swat/registerZrl20252026round2.vue'),
      },
      {
        name: 'registerAcademy',
        path: '/itwatts/team/swat/register-academy',
        component: () => import('@/views/itwatts/team/swat/registerAcademy.vue'),
      },
      {
        name: 'merch',
        path: '/itwatts/team/swat/merch',
        component: () => import('@/views/itwatts/team/swat/merch.vue'),
      },
      {
        name: 'registerTTT',
        path: '/itwatts/team/swat/register-ttt',
        component: () => import('@/views/itwatts/team/swat/registerTTT.vue'),
      },
      {
        name: 'test',
        path: '/itwatts/team/swat/test',
        component: () => import('@/views/itwatts/team/swat/test.vue'),
      },
      {
        name: 'p-loop',
        path: '/itwatts/team/rpv/p-loop',
        component: () => import('@/views/itwatts/team/rpv/pLoop.vue'),
      },
      /*{
          name: 'default',
          path: '/',
          redirect: to => {
            return '/itwatts/signin'
          }
      },*/
      {
        name: 'home',
        path: '/itwatts/home',
        component: () => import('@/views/itwatts/home.vue'),
      },
      {
        name: 'swatHome',
        path: '/itwatts/team/swat',
        component: () => import('@/views/itwatts/team/swat/home.vue'),
      },        
    ]
};

export default MainRoutes;
