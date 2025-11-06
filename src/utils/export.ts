import { getVeloCategory } from '@/utils/zwiftRacing';

function exportUser(user?: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };
  result.headers = [
    'Prénom',
    'Nom',
    'Genre',
    'Courriel',
    'Ville',
    'Region',
    'Roles',
    'Groupes',
    'Trainers',
    'Capteurs de puissances',
    'ZP Id',
    'Équipe IRL',
    'Discord (Nom)',
    'Discord (Roles)',    
    'Zwift (Nom)',
    'Zwift (Club 5.W.4.T status)',
    'Zwift (date synchronization)',
    'Zwift Racing App vELO',
    'Zwift Racing App vELO Cat',
    'Zwift Racing App (date synchronization)',
    'ZP category',
    'ZP zrs',
    'ZP race ranking',
    'ZP bio',
    'ZP Grandeur (cm)',
    'ZP Poids (kg)',
    'ZP Poids (nb jours update)',
    'ZP dernier événement (nb jours)',
    'ZP date synchronization',
    'ZP équipe primaire',
    'ZP CP15secs Watts',
    'ZP CP15secs w/kg',
    'ZP CP15secs %',
    'ZP CP1 Watts',
    'ZP CP2 w/kg',
    'ZP CP1 %',
    'ZP CP5 Watts',
    'ZP CP5 w/kg',
    'ZP CP5 %',
    'ZP CP20 Watts',
    'ZP CP20 w/kg',
    'ZP CP20 %',
    'zp1Yr3AvgMaxCp20'
  ];
  
  if (!user) {
    return result;
  }
  
  const profileStats = user.zp_profile && user.zp_profile.profile_stats ? user.zp_profile.profile_stats : ' ';
  
  let discordRoles = [];
  if (user.discord_profile) {
    for (const role of user.discord_profile.roles) {
      if (role.name !== '@everyone') {
        discordRoles.push(role.name);
      }
    }
  }
  
  let primaryTrainer = user.trainers.find((trainer: any) => trainer.primary);
  if (primaryTrainer) {
    primaryTrainer = primaryTrainer.model;
  } else {
    console.log('empty for zp_id: ' + user.id)
  }
  
  result.value = [
    user.first_name,
    user.last_name,
    user.gender,
    user.email,
    user.ville,
    user.region,
    `"${user.roles.toString()}"`,
    `"${user.groups.toString()}"`,
    primaryTrainer,
    `"${JSON.stringify(user.power_meters).toString().replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
    user.zp_id,
    user.irl_team,
    user.discord_profile ? user.discord_profile.globalName : '',
    discordRoles.length > 0 ? `"${discordRoles.toString()}"` : ' ',    
    user.zwift_profile ? user.zwift_profile.firstName + ' ' + user.zwift_profile.lastName : ' ',
    (user.zwift_profile && user.zwift_profile.clubs && user.zwift_profile.clubs.length > 0) ? (user.zwift_profile.clubs[0].clubId === '29068f3d-089c-4a38-842e-f67e8a4d52ef' ? user.zwift_profile.clubs[0].status : '') : ' ',
    user.zwift_profile ? user.zwift_profile.lastSynced : ' ',
    user.zwift_racing_app_profile && user.zwift_racing_app_profile.race ? Math.round(user.zwift_racing_app_profile.race.rating) : ' ',
    user.zwift_racing_app_profile && user.zwift_racing_app_profile.race ? getVeloCategory(Math.round(user.zwift_racing_app_profile.race.rating)) : ' ',
    user.zwift_racing_app_profile ? user.zwift_racing_app_profile.lastSynced.split('T')[0] : ' ',
    user.zp_profile ? user.zp_profile.category : ' ',
    user.zp_profile ? user.zp_profile.zrs : ' ',
    user.zp_profile ? user.zp_profile.race_ranking : ' ',
    user.zp_profile ? `"${user.zp_profile.bio.replaceAll(/\n/g,'').replaceAll('"', '\'')}"` : ' ',
    user.zp_profile && user.zp_profile.processed ? user.zp_profile.processed.newest_event_height : '',
    user.zp_profile && user.zp_profile.processed ? user.zp_profile.processed.newest_event_weight : '',
    user.zp_profile && user.zp_profile.processed && user.zp_profile.processed.date_last_updated_weight ? 
      Math.round((new Date().getTime() -
      new Date(user.zp_profile.processed.date_last_updated_weight).getTime()) / (1000 * 3600 * 24)) : '',
    user.zp_profile && user.zp_profile.processed && user.zp_profile.processed.date_last_event ? 
      Math.round((new Date().getTime() -
      new Date(user.zp_profile.processed.date_last_event).getTime()) / (1000 * 3600 * 24)) : '',
    user.zp_profile ? user.zp_profile.last_modified.split('T')[0] : ' ',
    user.zp_profile ? user.zp_profile.primary_team_name : ' ',
    profileStats.w15,
    profileStats.wkg15,
    profileStats.w15_percentage,
    profileStats.w60,
    profileStats.wkg60,
    profileStats.w60_percentage,
    profileStats.w300,
    profileStats.wkg300,
    profileStats.w300_percentage,
    profileStats.w1200,
    profileStats.wkg1200,
    profileStats.w1200_percentage,
    user.zp_profile && user.zp_profile.processed ? user.zp_profile.processed.zp1Yr3AvgMaxCp20 : '',
  ];
  return result;
}



function exportClubLadderFormHeadersForm(form?: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };

  result.headers = [
    'Capitaine d\'équipe',    
    'Période',
    'Fréquence',
    'Dispo lundi',
    'Dispo mardi',
    'Dispo mercredi',
    'Dispo jeudi',
    'Dispo vendredi',
    'Dispo samedi',
    'Dispo dimanche',
    'Commentaires',    
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.capInterest}"` || ' ',
    `"${form.frequency}"` || ' ',    
    `"${form.lundi.toString()}"`,
    `"${form.mardi.toString()}"`,
    `"${form.mercredi.toString()}"`,
    `"${form.jeudi.toString()}"`,
    `"${form.vendredi.toString()}"`,
    `"${form.samedi.toString()}"`,  
    `"${form.dimanche.toString()}"`,
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
  ]; 

  return result;
}

function export2025PollForm(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };

  result.headers = [
    'Niveau satisfaction',
    'Recommandation équipe',
    'Satisfaction activités sociales proposées',
    'Satisfaction courses proposées',
    'Satisfaction workouts proposées',
    'Intérèt club ladder',
    'Intérèt ZRL',
    'Intérèt TTT',
    'Intérèt ITT',
    'Intérèt FRR',
    'Intérèt workouts',
    'Intérèt dirt racing',
    'Intérèt SRC mywhoosh',
    'Intérèt echelon mywhoosh',
    'Intérèt championship mywhoosh',
    'Horaire adaptée',
    'Suggestion séries',
    'Satisfaction intégration',
    'Ambiance',
    'Esprit de communauté',
    'Communication équipe',
    'Implication des animateurs/organisateurs',
    'Nouveauté dans l’équipe?',
    'Aspect est le plus important',
    'Suggestion améliorations',    
  ];

  if (!form) {
    return result;
  }
  
  result.value = [
    `"${form.satisfactionLevel}"` || ' ',
    `"${form.swatRecommendation}"` || ' ',
    `"${form.socialActivitiesQuantity}"` || ' ',    
    `"${form.racesQuantity}"` || ' ',    
    `"${form.workoutsQuantity}"` || ' ',
    `"${form.clubLadderInterest.toString()}"`,
    `"${form.zrlInterest.toString()}"`,
    `"${form.tttInterest.toString()}"`,
    `"${form.ittInterest.toString()}"`,
    `"${form.frrInterest.toString()}"`,
    `"${form.workoutInterest.toString()}"`,
    `"${form.dirtRacingInterest.toString()}"`,
    `"${form.srcInterest.toString()}"`,
    `"${form.echelonRacingInterest.toString()}"`,
    `"${form.championshipInterest.toString()}"`,
    `"${form.scheduleTime.toString()}"`,
    `"${form.seriesSugestion.toString()}"`,
    `"${form.integrationLevel.toString()}"`,
    `"${form.teamAmbiance.toString()}"`,
    `"${form.teamSpirit.toString()}"`,
    `"${form.communicationSatisfaction.toString()}"`,
    `"${form.organizerComments.toString()}"`,    
    `"${form.newThingsToSee.toString()}"`,    
    `"${form.mostImportantThing.toString()}"`,    
    `"${form.moreSuggestions.toString()}"`,
  ]; 

  return result;
}

function exportZrl20252026Round1Form(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };
  

  result.headers = [
    'Intérêt de course',
    'Horaire ZRL',
    'Status Membre vs Invité',
    'Préférence de catégorie',
    'Expérience courses ZRL',
    'Choix qui s\'applique',
    'Capitaine d\'équipe',
    'Directeur sportif',
    'Autre courreurs',
    'Commentaires',
    'Dispo sept16Course',
    'Dispo sept23Course',
    'Dispo sept30Course',
    'Dispo oct7Course',    
  ];

  if (!form) {
    return result;
  }

  result.value = [
    form.raceInterest || ' ',
    form.timeInterest || ' ',
    form.userStatus || ' ',
    `"${form.catPreferences.toString()}"`,
    `"${form.experience.toString()}"`,
    `"${form.choicesThatApply.toString()}"`,
    `"${form.capInterest.toString()}"`,
    `"${form.dsInterest.toString()}"`,
    `"${form.othersTeamPlayerNames}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
    `"${form.sept16Course.toString()}"`,
    `"${form.sept23Course.toString()}"`,
    `"${form.sept30Course.toString()}"`,
    `"${form.oct7Course.toString()}"`,
  ];  

  return result;
}

function exportZrl20252026Round2Form(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };
  

  result.headers = [
    'Horaire ZRL 6h00',
    'Horaire ZRL 7h00',
    'Horaire ZRL 8h00',
    'Horaire ZRL 12h00',
    'Horaire ZRL 18h30',
    'Horaire ZRL 19h30',    
    'Status Membre vs Invité',
    'Préférence de catégorie',
    'Expérience courses ZRL',
    'Choix qui s\'applique',
    'Capitaine d\'équipe',
    'Directeur sportif',
    'Autre courreurs',
    'Commentaires',
    'Dispo nov4Course',
    'Dispo nov11Course',
    'Dispo nov18Course',
    'Dispo nov25Course',
    'Dispo dec2Course',
    'Dispo dec9Course',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.preferedTime6h00}"` || ' ',
    `"${form.preferedTime7h00}"` || ' ',
    `"${form.preferedTime8h00}"` || ' ',
    `"${form.preferedTime12h00}"` || ' ',
    `"${form.preferedTime18h30}"` || ' ',
    `"${form.preferedTime19h30}"` || ' ',    
    form.userStatus || ' ',
    `"${form.catPreferences ? form.catPreferences.toString() : form.catPreference.toString()}"`,
    `"${form.experience.toString()}"`,
    `"${form.choicesThatApply.toString()}"`,
    `"${form.capInterest.toString()}"`,
    `"${form.dsInterest.toString()}"`,
    `"${form.othersTeamPlayerNames}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
    `"${form.nov4Course.toString()}"`,
    `"${form.nov11Course.toString()}"`,
    `"${form.nov18Course.toString()}"`,
    `"${form.nov25Course.toString()}"`,
    `"${form.dec2Course.toString()}"`,
    `"${form.dec9Course.toString()}"`,
  ];  

  return result;
}

function exportWTRLZrlForm(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };

  result.headers = [
    'Horaire ZRL 12h00',
    'Horaire ZRL 18h30',
    'Horaire ZRL 19h30',
    'Expérience TTT',
    'Aimerais avoir mentor',
    'Dispo pour être mentor',
    'Préférence d\'équipe',
    'Capitaine d\'équipe',
    'Directeur sportif',
    'Review',
    'Commentaires',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.preferredTime12h00 || ''}"`,
    `"${form.preferredTime18h30 || ''}"`,
    `"${form.preferredTime19h30 || ''}"`,
    `"${form.experienceInTTT || ''}"`,    
    `"${form.needMentor || ''} "`,
    `"${form.canBeMentor || ''}"`,
    `"${form.preferredTeam || ''}"`,    
    `"${form.capInterest.toString()}"`,
    `"${form.dsInterest.toString()}"`,    
    `"${form.rating || ''}"`,
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
  ]; 

  return result;
}

function exportGuestSwatForm(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };

  result.headers = [
    'Prénom',
    'Nom',
    'Adresse courriel',
    'Région',
    'Région (autres)',
    'Club IRL',
    'Autre club IRL',
    'Autre club Virtuel',
    'Nom autre club Virtuel',
    'Connaissances',
    'Raisons motivent',
    'Intéressé(e) aux activitées virtuelles',
    'Intéressé(e) rides sociaux',
    'Intéressé(e) activité IRL',
    'Intéressé(e) placotter',
    'Autres commentaires',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.firstName}"` || ' ',
    `"${form.lastName}"` || ' ',
    `"${form.email}"` || ' ',
    `"${form.region}"` || ' ',
    `"${form.regionOther}"` || ' ',
    `"${form.irlTeam}"` || ' ',
    `"${form.irlTeamOther}"` || ' ',
    `"${form.partOfVirtualTeam}"` || ' ',
    `"${form.virtualTeam}"` || ' ',
    `"${form.knowSwatMembersNames.toString()}"`,
    `"${form.reasonsToJoin}"` || ' ',
    `"${form.wantToParticipeInVirtualActivities}"` || ' ',
    `"${form.wantToParticipeInSocialRides}"` || ' ',
    `"${form.wantToParticipeIRLActivities}"` || ' ',
    `"${form.wantToParticipeInChatting}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
  ]; 

  return result;
}

function exportInterestSwatForm(form: any) {
  let result = {
    headers: [] as any,
    value: [] as any,
  };

  result.headers = [
    'Prénom',
    'Nom',
    'Adresse courriel',
    'Région',
    'Région (autres)',
    'Date de naissance',
    'Grandeur (cm)',
    'Poids (kg)',
    'Club IRL',
    'Autre club IRL',
    'Autre club Virtuel',
    'Nom autre club Virtuel',
    'Connaissances',
    'Base entrainement',
    'Base entrainement (autre)',
    'Deuxième capteur',
    'Deuxième capteur (autre)',
    'Vélo virtuel (hrs)',
    'Participe course virtuelle',
    'Jamais participé course virtuelle',
    'Pas intéressé aux courses',
    'Évènement participés',
    'Entrainement structuré intérèt',
    'Ride sociales intérèt',
    'Course contre la montre (TTT) intérèt',
    'Série hebdomadaire (style ZRL) intérèt',
    'Course à étape (style FRR) intérèt',
    'Course équipe vs équipe (Club Ladder) intérèt',
    'Autre plateforme intérèt',
    'Vélo IRL (hrs)',
    'Integrité - Importance valeur authentique',
    'Integrité - Peu d\'intérêt valider performance',
    'Respect - Bon perdant',
    'Engagement - Investir pleinement',
    'Engagement - Intention role actif',
    'Engagement - Engagement minime',
    'Attitude 5.W.4.T',
    'Implication - Capitaine',
    'Implication - Organiser série',
    'Implication - Aider aux partages de connaissances',
    'Implication - Tester outils technologiques',
    'Autres sports',
    'Raisons motivent',
    'Autres commentaires',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.firstName}"` || ' ',
    `"${form.lastName}"` || ' ',
    `"${form.email}"` || ' ',
    `"${form.region}"` || ' ',
    `"${form.regionOther}"` || ' ',
    `"${form.birthday}"` || ' ',
    `"${form.height}"` || ' ',
    `"${form.weight}"` || ' ',
    `"${form.irlTeam}"` || ' ',
    `"${form.irlTeamOther}"` || ' ',
    `"${form.partOfVirtualTeam}"` || ' ',
    `"${form.virtualTeam}"` || ' ',
    `"${form.knowSwatMembersNames.toString()}"`,
    `"${form.trainerModel}"` || ' ',
    `"${form.trainerModelOther}"` || ' ',
    `"${form.secondaryPowerSourceModel}"` || ' ',
    `"${form.secondaryPowerSourceModelOther}"` || ' ',
    `"${form.hoursWorkoutSummer}"` || ' ',
    `"${form.virtualRacesParticipation.toString()}"`,
    `"${form.virtualRacesNeverParticated.toString()}"`,
    `"${form.virtualRacesNotInterested.toString()}"`,
    `"${form.racesOrEvents}"` || ' ',
    `"${form.workoutsInterest}"` || ' ',
    `"${form.socialRidesInterest}"` || ' ',
    `"${form.tttInterest}"` || ' ',
    `"${form.zrlInterest}"` || ' ',
    `"${form.stageRacesInterest}"` || ' ',
    `"${form.clubLadderInterest}"` || ' ',
    `"${form.otherPlatformInterest}"` || ' ',
    `"${form.hoursWorkoutWinter}"` || ' ',
    `"${form.integrityValuesAuthenticPerformances.toString()}"`,
    `"${form.integrityValuesLowInterestPerformanceValidation.toString()}"`,    
    `"${form.respectValuesBadLooser.toString()}"`,        
    `"${form.engagementValuesInvested.toString()}"`,
    `"${form.engagementValuesTeamMembershipInterest.toString()}"`,
    `"${form.engagementValuesLowEngagementOnly.toString()}"`,
    `"${form.topSwatValue}"` || ' ',
    `"${form.teamCapitain}"` || ' ',
    `"${form.organizeCourseSerie}"` || ' ',
    `"${form.helpShareKnowledge}"` || ' ',
    `"${form.testingTechTools}"` || ' ',
    `"${form.otherSports}"` || ' ',
    `"${form.reasonsToJoin}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
  ]; 

  return result;
}

export {
  exportUser,
  exportZrl20252026Round1Form,
  exportZrl20252026Round2Form,
  exportClubLadderFormHeadersForm,
  export2025PollForm,
  exportInterestSwatForm,
  exportGuestSwatForm,
  exportWTRLZrlForm
}
