function addUserCompliance(user) {
  user.zwift_status_compliance = '❌';
  user.zwift_name = '❌';
  user.zwift_name_compliance = '❌';
  user.zwift_name = '';
  user.zp_bio_compliance = '❌';
  user.zp_dual = `N'a pas de dual recording...`;
  user.zp_dual_compliance = '✅';
  user.zp_strava_compliance = '❌';
  user.strava_url_compliance = user.strava_url ? '✅'  : '❌';
  user.discord_profile_compliance = user.discord_profile ? '✅'  : '❌';
  user.zp_nb_days_last_updated_weight_compliance = '❌';
  
  if (user.zwift_profile) {
    user.zwift_name = `${user.zwift_profile.firstName} ${user.zwift_profile.lastName}`;
    user.zwift_name_compliance = (user.zwift_profile.firstName.includes('5.W.4.T') ||
      user.zwift_profile.lastName.includes('5.W.4.T')) ? '✅' : '❌';
    user.zwift_status = user.zwift_profile.clubs[0].status;
    user.zwift_status_compliance = user.zwift_profile.clubs[0].status === 'MEMBER' ? '✅' : '❌';
    user.zwift_last_synced = new Date(user.zwift_profile.lastSynced).toLocaleDateString();        
  }

  if (user.zp_profile) {
    user.zp_primary_team_name = user.zp_profile.primary_team_name;
    user.zp_primary_team_name_compliance = user.zp_profile.primary_team_name === '5.W.4.T' ? '✅' : '❌';
    user.zp_strava_compliance = user.zp_profile.strava_profile_url ? '✅' : '❌';
    user.zp_bio_compliance = user.zp_profile.bio.includes('Primary') || 
    user.zp_profile.bio.includes('Power source') ||
    user.zp_profile.bio.includes('Zwift Setup') 
    ? '✅' : '❌';
    user.zp_last_synced = new Date(user.zp_profile.last_modified).toLocaleDateString();

    if ((user.gender === 'F' && user.zp_profile.profile_stats.wkg1200 >= 3.8) ||
      user.gender !== 'F' && user.zp_profile.profile_stats.wkg1200 >= 4.6) {
      user.zp_dual_compliance = '❌';

      if (user.zp_profile.dual_recordings && user.zp_profile.dual_recordings.length > 0) {
        user.zp_dual = Math.round(
            (new Date().getTime() - new Date(user.zp_profile.dual_recordings[user.zp_profile.dual_recordings.length - 1].date * 1000).getTime()) / (1000 * 3600 * 24));  

        if (user.zp_dual < 365) {
          user.zp_dual_compliance = '✅';
        } else {
          user.zp_dual = `${user.zp_dual} jours depuis le dernier dual...`;
        }
      }
    }
    user.zp_nb_days_last_updated_weight = 
      Math.round((new Date().getTime() -
      new Date(user.zp_profile.processed.date_last_updated_weight).getTime()) / (1000 * 3600 * 24));
    if (user.zp_nb_days_last_updated_weight < 365) {
      user.zp_nb_days_last_updated_weight_compliance = '✅';          
    } else if (user.zp_nb_days_last_updated_weight >= 365) {
      user.zp_nb_days_last_updated_weight = `${user.zp_nb_days_last_updated_weight} jours depuis la dernière pesé...`;
    }

    user.admin_zp_nb_days_last_event = 
      Math.round((new Date().getTime() -
      new Date(user.zp_profile.processed.date_last_event).getTime()) / (1000 * 3600 * 24));        
  }

  user.compliance_percentage = Math.round(((
    (user.discord_profile_compliance === '✅' ? 1 : 0) +
    (user.zwift_name_compliance === '✅' ? 1 : 0) +
    (user.zwift_status_compliance === '✅' ? 1 : 0) +
    (user.zp_bio_compliance === '✅' ? 1 : 0) +
    (user.zp_primary_team_name_compliance === '✅' ? 1 : 0) +
    (user.zp_nb_days_last_updated_weight_compliance === '✅' ? 1 : 0) +
    (user.zp_dual_compliance === '✅' ? 1 : 0) +
    (user.zp_strava_compliance === '✅' ? 1 : 0) +
    (user.strava_url_compliance === '✅' ? 1 : 0)) / 9) * 100);
}

export { addUserCompliance }
