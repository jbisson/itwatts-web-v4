function exportUser(user) {
  let result = {
    headers: [],
    value: [],
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
  
  let primaryTrainer = user.trainers.find((trainer) => trainer.primary);
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

function exportClubLadder2024FormHeadersForm(form) {
  let result = {
    headers: [],
    value: [],
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

function exportZrl20242025Round2Form(form) {
  let result = {
    headers: [],
    value: [],
  };

  result.headers = [
    'Horaire ZRL 12h00',
    'Horaire ZRL 18h30',
    'Horaire ZRL 19h30',
    'Préférence de catégorie',
    'Expérience ZRL',
    'Jamais participé TTT',
    'Connait pas FTS/FAL',
    'Niveau compétitif',
    'Capitaine d\'équipe',
    'Directeur sportif',
    'Autre courreurs',
    'Commentaires',
    'Dispo nov12Course',
    'Dispo nov19Course',
    'Dispo nov26Course',
    'Dispo dec3Course',
    'Dispo dec10Course',
    'Dispo dec17Course',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.preferedTime12h00}"` || ' ',
    `"${form.preferedTime18h30}"` || ' ',
    `"${form.preferedTime19h30}"` || ' ',
    `"${form.catPreferences.toString()}"`,
    `"${form.experienceInZRL}"` || ' ',    
    `"${form.neverDidTTT}"` || ' ',
    `"${form.dontKnowFtsFal}"` || ' ',
    `"${form.competitiveLevel}"` || ' ',    
    `"${form.capInterest.toString()}"`,
    `"${form.dsInterest.toString()}"`,
    `"${form.othersTeamPlayerNames}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
    `"${form.nov12Course.toString()}"`,
    `"${form.nov19Course.toString()}"`,
    `"${form.nov26Course.toString()}"`,
    `"${form.dec3Course.toString()}"`,
    `"${form.dec10Course.toString()}"`,
    `"${form.dec17Course.toString()}"`,    
  ]; 

  return result;
}

function exportZrl20242025Round3Form(form) {
  let result = {
    headers: [],
    value: [],
  };

  result.headers = [
    'Horaire ZRL 12h00',
    'Horaire ZRL 18h30',
    'Horaire ZRL 19h30',
    'Préférence de catégorie',
    'Expérience ZRL',
    'Jamais participé TTT',
    'Connait pas FTS/FAL',
    'Niveau compétitif',
    'Capitaine d\'équipe',
    'Directeur sportif',
    'Autre courreurs',
    'Commentaires',
    'Dispo jan14Course',
    'Dispo jan21Course',
    'Dispo jan28Course',
    'Dispo 4fevCourse',
    'Dispo 11fevCourse',
    'Dispo 18febCourse',
  ];

  if (!form) {
    return result;
  }

  result.value = [
    `"${form.preferedTime12h00}"` || ' ',
    `"${form.preferedTime18h30}"` || ' ',
    `"${form.preferedTime19h30}"` || ' ',
    `"${form.catPreferences.toString()}"`,
    `"${form.experienceInZRL}"` || ' ',    
    `"${form.neverDidTTT}"` || ' ',
    `"${form.dontKnowFtsFal}"` || ' ',
    `"${form.competitiveLevel}"` || ' ',    
    `"${form.capInterest.toString()}"`,
    `"${form.dsInterest.toString()}"`,
    `"${form.othersTeamPlayerNames}"` || ' ',
    `"${(form.comment || '').replaceAll(/\n/g,'').replaceAll('"', '\'')}"`,
    `"${form.course1.toString()}"`,
    `"${form.course2.toString()}"`,
    `"${form.course3.toString()}"`,
    `"${form.course4.toString()}"`,
    `"${form.course5.toString()}"`,
    `"${form.course6.toString()}"`,    
  ]; 

  return result;
}

function exportWTRLZrlForm(form) {
  let result = {
    headers: [],
    value: [],
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

function exportZrl2024WinterFormHeadersForm(form) {
  let result = {
    headers: [],
    value: [],
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
    'Dispo jan23Course',
    'Dispo jan30Course',
    'Dispo feb6Course',
    'Dispo feb13Course',
    'Dispo feb20Course',
    'Dispo feb27Course',
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
    `"${form.jan23Course.toString()}"`,
    `"${form.jan30Course.toString()}"`,
    `"${form.feb6Course.toString()}"`,
    `"${form.feb13Course.toString()}"`,
    `"${form.feb20Course.toString()}"`,
    `"${form.feb27Course.toString()}"`,    
  ]; 

  return result;
}

function exportGuestSwat2024Form(form) {
  let result = {
    headers: [],
    value: [],
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

function exportInterestSwat2024Form(form) {
  let result = {
    headers: [],
    value: [],
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
    'Integrité - Accepte faire tests',
    'Respect - Priorisé groupe',
    'Respect - Respecte adversaires',
    'Respect - Bon perdant',
    'Respect - Partage success',
    'Respect - Uniquement objectifs personnels',
    'Engagement - Investir pleinement',
    'Engagement - Intention role actif',
    'Engagement - Recherche sentiment d\'appartenance',
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
    `"${form.integrityValuesAcceptTests.toString()}"`,
    `"${form.respectValuesPriorizeGroup.toString()}"`,
    `"${form.respectValuesRespectOthers.toString()}"`,
    `"${form.respectValuesBadLooser.toString()}"`,
    `"${form.respectValuesSharedLost.toString()}"`,
    `"${form.respectValuesOwnObjectivesOnly.toString()}"`,
    `"${form.engagementValuesInvested.toString()}"`,
    `"${form.engagementValuesTeamMembershipInterest.toString()}"`,
    `"${form.engagementValuesBelongingToAGroup.toString()}"`,
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
  exportZrl2024WinterFormHeadersForm,
  exportZrl20242025Round2Form,
  exportZrl20242025Round3Form,
  exportClubLadder2024FormHeadersForm,
  exportInterestSwat2024Form,
  exportGuestSwat2024Form,
  exportWTRLZrlForm
}
