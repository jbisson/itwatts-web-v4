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
        path: '/itwatts/team/:teamName/info',
        component: () => import('@/views/itwatts/team/info.vue'),
      },
      {
        path: '/itwatts/team/:teamName/info-team',
        component: () => import('@/views/itwatts/team/info.vue'),
      },
      {
        path: '/itwatts/team/:teamName/strava',
        component: () => import('@/views/itwatts/team/strava.vue'),
      },
      {
        path: '/itwatts/team/:teamName/manage',
        component: () => import('@/views/itwatts/team/manage.vue'),
      },
      {
        path: '/itwatts/team/:teamName/power-stats',
        component: () => import('@/views/itwatts/team/powerStats.vue'),
      },
      {
        path: '/itwatts/fera/info',
        component: () => import('@/views/itwatts/fera/info.vue'),
      },
      {
        path: '/itwatts/fera/rider',
        component: () => import('@/views/itwatts/fera/rider.vue'),
      },
      {
        path: '/itwatts/fera/all-riders',
        component: () => import('@/views/itwatts/fera/allRiders.vue'),
      },
      {
        path: '/itwatts/fera/validations',
        component: () => import('@/views/itwatts/fera/validations.vue'),
      },
      {
        path: '/itwatts/fera/addValidation',
        component: () => import('@/views/itwatts/fera/addValidation.vue'),
      },
      {
        path: '/itwatts/fera/transparency',
        component: () => import('@/views/itwatts/fera/transparency.vue'),
      },
      {
        path: '/itwatts/super-admin/teams',
        component: () => import('@/views/itwatts/super-admin/teams.vue'),
      },
      {
        path: '/itwatts/signin',
        component: () => import('@/views/itwatts/signin.vue'),
      },
      {
        path: '/itwatts/accept-team-invite',
        component: () => import('@/views/itwatts/teamInvite.vue'),
      },
      {
        path: '/itwatts/user/profile/:userID',
        component: () => import('@/views/itwatts/user/profile/user.vue'),
      },
      {
        name: 'cb',
        path: '/itwatts/cb',
        component: () => import('@/views/itwatts/cb.vue'),
      },
      {
        name: 'data-deletion',
        path: '/itwatts/data-deletion',
        component: () => import('@/views/itwatts/data-deletion.vue'),
      },
      {
        name: 'privacy',
        path: '/itwatts/privacy',
        component: () => import('@/views/itwatts/privacy.vue'),
      },  
    ]
};

export default MainRoutes;
