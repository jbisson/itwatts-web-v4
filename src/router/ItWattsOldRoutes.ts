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
        path: '/itwatts/team/swat-old/admin/clubladder-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/clubLadderRegistrations.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/discord',
        component: () => import('@/views/itwatts/team/swat/admin/discord.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/info',
        component: () => import('@/views/itwatts/team/swat/admin/info.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-guests',
        component: () => import('@/views/itwatts/team/swat/admin/swatGuests.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-guests2023',
        component: () => import('@/views/itwatts/team/swat/admin/swatGuests2023.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-interest-forms2024',
        component: () => import('@/views/itwatts/team/swat/admin/swatInterestForms2024.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-guest-forms2024',
        component: () => import('@/views/itwatts/team/swat/admin/swatGuestForms2024.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-members',
        component: () => import('@/views/itwatts/team/swat/admin/swatMembers.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-members2023',
        component: () => import('@/views/itwatts/team/swat/admin/swatMembers2023.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/swat-members-poster',
        component: () => import('@/views/itwatts/team/swat/admin/swatMembersPoster.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/users',
        component: () => import('@/views/itwatts/team/swat/admin/users.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/zrl20242025-round2-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/zrl20242025Round2Registrations.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/zrl20242025-round3-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/zrl20242025Round3Registrations.vue'),
      },
      {
        path: '/itwatts/team/swat-old/admin/wtrlttt-registrations',
        component: () => import('@/views/itwatts/team/swat/admin/wtrlTTTRegistrations.vue'),
      },      
      {
        path: '/itwatts/team/swat-old/admin/zwiftpower',
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
        path: '/itwatts/team/swat-old/itt/results',
        redirect: to => {
          return '/itwatts/team/swat/itt/results/18'
        }
      },
      {
        path: '/itwatts/team/swat-old/itt/results/:serie',
        component: () => import('@/views/itwatts/team/swat/itt/results.vue'),
      },
      {
        name: 'email',
        path: '/itwatts/email',
        component: () => import('@/views/itwatts/email.vue'),
      },
      {
        name: 'admission',
        path: '/itwatts/team/swat-old/admission',
        component: () => import('@/views/itwatts/team/swat/admission.vue'),
      },
      {
        name: 'compliance',
        path: '/itwatts/team/swat-old/compliance',
        component: () => import('@/views/itwatts/team/swat/compliance.vue'),
      },
      {
        name: 'frr',
        path: '/itwatts/team/swat-old/frr',
        component: () => import('@/views/itwatts/team/swat/frr.vue'),
      },
      {
        name: 'fullcalendar',
        path: '/itwatts/team/swat-old/fullcalendar',
        component: () => import('@/views/itwatts/team/swat/fullCalendar.vue'),
      },
      {
        name: 'guests',
        path: '/itwatts/team/swat-old/guests',
        component: () => import('@/views/itwatts/team/swat/guests.vue'),
      },
      {
        name: 'info',
        path: '/itwatts/team/swat-old/info',
        component: () => import('@/views/itwatts/team/swat/info.vue'),
      },
      {
        name: 'interest',
        path: '/itwatts/team/swat-old/interest',
        component: () => import('@/views/itwatts/team/swat/interest.vue'),
      },
      {
        name: 'invite',
        path: '/itwatts/team/swat-old/invite',
        component: () => import('@/views/itwatts/team/swat/invite.vue'),
      },
      {
        name: 'ircalendar',
        path: '/itwatts/team/swat-old/irlcalendar',
        component: () => import('@/views/itwatts/team/swat/irlCalendar.vue'),
      },
      {
        name: 'members',
        path: '/itwatts/team/swat-old/members',
        component: () => import('@/views/itwatts/team/swat/members.vue'),
      },
      {
        name: 'participation',
        path: '/itwatts/team/swat-old/participation',
        component: () => import('@/views/itwatts/team/swat/participation.vue'),
      },
      {
        name: 'performanceAnalysis',
        path: '/itwatts/team/swat-old/performance-analysis',
        component: () => import('@/views/itwatts/team/swat/performanceAnalysis.vue'),
      },
      {
        name: 'registerClubLadder',
        path: '/itwatts/team/swat-old/register-clubladder',
        component: () => import('@/views/itwatts/team/swat/registerClubLadder.vue'),
      },
      {
        name: 'registerZrl2024winter',
        path: '/itwatts/team/swat-old/register-zrl2024winter',
        component: () => import('@/views/itwatts/team/swat/registerZrl2024winter.vue'),
      },
      {
        name: 'registerZrl',
        path: '/itwatts/team/swat-old/register-zrl',
        component: () => import('@/views/itwatts/team/swat/registerZrl.vue'),
      },
      {
        name: 'registerTTT',
        path: '/itwatts/team/swat-old/register-ttt',
        component: () => import('@/views/itwatts/team/swat/registerTTT.vue'),
      },
      {
        name: 'test',
        path: '/itwatts/team/swat-old/test',
        component: () => import('@/views/itwatts/team/swat/test.vue'),
      },
      {
          name: 'default',
          path: '/',
          redirect: to => {
            return '/itwatts/signin'
          }
      },
      {
        name: 'home',
        path: '/itwatts/home',
        component: () => import('@/views/itwatts/home.vue'),
      },
      {
        name: 'swatHome',
        path: '/itwatts/team/swat-old',
        component: () => import('@/views/itwatts/team/swat/home.vue'),
      },        
    ]
};

export default MainRoutes;
