import { toast } from "react-toastify";
import dispatchFireworks from "../utils/fireworks-dispatcher";

import {
  GET_ALL_SEASONS_SUCCESS,
  GET_ALL_SEASONS_FAILED,
  GET_ALL_SEASON_TEAMS_SUCCESS,
  GET_ALL_SEASON_TEAMS_FAILED,
  SET_ACTIVE_SEASON,
  SET_ACTIVE_SEASON_FAILED,
  SWITCH_SEASON,
  SWITCH_SEASON_FAILED,
  FETCH_PREFERENCES_SUCCESS,
  FETCH_PREFERENCES_FAILED,
  SET_CHALLENGES_LIST,
  SET_CHALLENGES_LIST_FAILED,
  GET_CHALLENGE_DETAILS_SUCCESS,
  GET_CHALLENGE_DETAILS_FAILED,
  GET_TEAM_DETAILS_SUCCESS,
  GET_TEAM_DETAILS_FAILED,
  BUY_CHALLENGE_SUCCESS,
  BUY_CHALLENGE_FAILED,
  VALIDATE_CHALLENGE_SUCCESS,
  VALIDATE_CHALLENGE_FAILED,
  CLOSE_CHALLENGE_SUCCESS,
  CLOSE_CHALLENGE_FAILED,
  SET_ACTIVE_TEAM,
  CREATE_TEAM_SUCCESS,
  CREATE_TEAM_FAILED,
  LIST_USER_TEAMS_INVITATIONS_SUCCESS,
  LIST_USER_TEAMS_INVITATIONS_FAILED,
  INVITE_USER_TO_TEAM_SUCCESS,
  INVITE_USER_TO_TEAM_FAILED,
  ACCEPT_TEAM_INVITATION_SUCCESS,
  ACCEPT_TEAM_INVITATION_FAILED,
  DECLINE_TEAM_INVITATION_SUCCESS,
  DECLINE_TEAM_INVITATION_FAILED,
  FETCH_USER_SEASONS_SUCCES,
  FETCH_USER_SEASONS_FAILED,
} from "../constants/actionTypes";

import {
  getAllSeasons,
  getAllSeasonTeams,
  getChallenges,
  getChallengeDetails,
  getTeamDetails,
  postBuyChallenge,
  postValidateChallenge,
  postCloseChallenge,
  postCreateTeam,
  postPreferences,
  postInviteUserToTeam,
  postAnswerTeamInvitation,
} from "../api/seasons";
import {apiErrorsCode} from "../constants/apiErrorsCode";

//Season main actions
export const fetchPreferences = seasonID => async dispatch => {
  try {
    await postPreferences(seasonID);

    dispatch({
      type: FETCH_PREFERENCES_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: FETCH_PREFERENCES_FAILED,
      payload: { error },
    });
  }
};

export const switchSeason = seasonSlug => async dispatch => {
  try {
    await postPreferences(seasonSlug);

    dispatch({
      type: SWITCH_SEASON,
    });
    toast.success("Switch season SUCCESS!");
  } catch (error) {
    dispatch({
      type: SWITCH_SEASON_FAILED,
      payload: { error },
    });
    toast.error("Switch season FAILED!");
  }
};

export const setActiveSeason = seasonData => async dispatch => {
  try {
    dispatch({
      type: SET_ACTIVE_SEASON,
      payload: { activeSeason: seasonData },
    });
  } catch (error) {
    dispatch({ type: SET_ACTIVE_SEASON_FAILED, payload: { error } });
    toast.error(`Set season active failed, please try again!`);
  }
};

export const fetchUserSeasons = userSeasons => async dispatch => {
  try {
    dispatch({
      type: FETCH_USER_SEASONS_SUCCES,
      payload: { userSeasons: userSeasons },
    });
  } catch (error) {
    dispatch({ type: FETCH_USER_SEASONS_FAILED, payload: { error } });
    toast.error(`Fetch user seasons failed, please try again!`);
  }
}

export const fetchAllSeasons = () => async dispatch => {
  try {
    const response = await getAllSeasons();
    const allSeasons = response.data.seasons;

    dispatch({
      type: GET_ALL_SEASONS_SUCCESS,
      payload: { allSeasons: allSeasons },
    });
  } catch (error) {
    dispatch({ type: GET_ALL_SEASONS_FAILED, payload: { error } });
  }
};

//Team actions
export const fetchAllSeasonTeams = seasonID => async dispatch => {
  try {
    const response = await getAllSeasonTeams(seasonID);
    const allTeams = response.data.items;

    dispatch({
      type: GET_ALL_SEASON_TEAMS_SUCCESS,
      payload: { allTeams: allTeams },
    });
  } catch (error) {
    dispatch({ type: GET_ALL_SEASON_TEAMS_FAILED, payload: { error } });
  }
};

export const fetchTeamDetails = teamID => async dispatch => {
  try {
    const response = await getTeamDetails(teamID);
    const detailsResponse = response.data.item;

    dispatch({
      type: GET_TEAM_DETAILS_SUCCESS,
      payload: {
        team: detailsResponse,
      },
    });
  } catch (error) {
    dispatch({
      type: GET_TEAM_DETAILS_FAILED,
      payload: { error },
    });
  }
};

export const setActiveTeam = teamData => async dispatch => {
  dispatch({
    type: SET_ACTIVE_TEAM,
    payload: {
      team: teamData,
    },
  });
};

export const createTeam = (seasonID, organizationID, name) => async dispatch => {
  try {
    const response = await postCreateTeam(seasonID, organizationID, name);

    dispatch({
      type: CREATE_TEAM_SUCCESS,
      payload: {
        team: response.data,
      },
    });

    toast.success(`Create team ${name} success!`);
  } catch (error) {
    dispatch({
      type: CREATE_TEAM_FAILED,
      payload: { error },
    });

    const errorText = apiErrorsCode.get(error.response.data.message.split(':')[0]) ?
      apiErrorsCode.get(error.response.data.message.split(':')[0]) : 'An error occurred';
    toast.error(`${errorText}`);
  }
};

export const fetchUserTeamsInvitations = userTeamsInvitations => async dispatch => {
  try {
    dispatch({
      type: LIST_USER_TEAMS_INVITATIONS_SUCCESS,
      payload: { userTeamsInvitations: userTeamsInvitations },
    });
  } catch (error) {
    dispatch({ type: LIST_USER_TEAMS_INVITATIONS_FAILED, payload: { error } });
  }
};

export const inviteUserToTeam = (teamID, name, organizationName, seasonName) => async dispatch => {
  try {
    const response = await postInviteUserToTeam(teamID, name);
    dispatch({
      type: INVITE_USER_TO_TEAM_SUCCESS,
      payload: {
        team: response.data,
      },
    });
    toast.success(`invite ${name} to the team ${organizationName} in ${seasonName} season success!`);
  } catch (error) {
    dispatch({
      type: INVITE_USER_TO_TEAM_FAILED,
      payload: { error },
    });
    const errorText = apiErrorsCode.get(error.response.data.message.split(':')[0]) ?
      apiErrorsCode.get(error.response.data.message.split(':')[0]) : 'An error occurred';
    toast.error(`${errorText}`);
  }
};

export const acceptTeamInvite = (teamInviteID, seasonName, organizationName) => async dispatch => {
  try {
    await postAnswerTeamInvitation(teamInviteID, true);
    dispatch({
      type: ACCEPT_TEAM_INVITATION_SUCCESS,
      payload: {
        teamInviteID: teamInviteID,
      },
    });
    toast.success(`accept invite to the team ${organizationName} in ${seasonName} season success!`);
  } catch (error) {
    dispatch({
      type: ACCEPT_TEAM_INVITATION_FAILED,
      payload: { error },
    });
    const errorText = apiErrorsCode.get(error.response.data.message.split(':')[0]) ?
      apiErrorsCode.get(error.response.data.message.split(':')[0]) : 'An error occurred';
    toast.error(`${errorText}`);
  }
};

export const declineTeamInvite = (teamInviteID, seasonName, organizationName) => async dispatch => {
  try {
    await postAnswerTeamInvitation(teamInviteID, false);
    dispatch({
      type: DECLINE_TEAM_INVITATION_SUCCESS,
      payload: {
        teamInviteID: teamInviteID,
      },
    });
    toast.success(`reject invite to the team ${organizationName} in ${seasonName} season success!`);
  } catch (error) {
    dispatch({
      type: DECLINE_TEAM_INVITATION_FAILED,
      payload: { error },
    });
    const errorText = apiErrorsCode.get(error.response.data.message.split(':')[0]) ?
      apiErrorsCode.get(error.response.data.message.split(':')[0]) : 'An error occurred';
    toast.error(`${errorText}`);
  }
};

//Challenge actions
export const fetchChallengeDetail = challengeID => async dispatch => {
  try {
    const response = await getChallengeDetails(challengeID);

    dispatch({
      type: GET_CHALLENGE_DETAILS_SUCCESS,
      payload: { challenge: response.data.item },
    });
  } catch (error) {
    dispatch({ type: GET_CHALLENGE_DETAILS_FAILED, payload: { error } });
  }
};

export const fetchChallenges = seasonID => async dispatch => {
  try {
    const response = await getChallenges(seasonID);
    dispatch({
      type: SET_CHALLENGES_LIST,
      payload: { activeChallenges: response.data.items },
    });
  } catch (error) {
    dispatch({ type: SET_CHALLENGES_LIST_FAILED, payload: { error } });
  }
};

export const buyChallenge = (flavorChallengeID, seasonID) => async dispatch => {
  try {
    const response = await postBuyChallenge(flavorChallengeID, seasonID);
    const subscription = response.data.challenge_subscription;
    const {
      season_challenge: {
        flavor: { challenge },
      },
    } = subscription;
    dispatch({
      type: BUY_CHALLENGE_SUCCESS,
      payload: {
        challengeSubscription: subscription,
      },
    });

    toast.success(`Buy challenge ${challenge.name} success!`);
  } catch (error) {
    dispatch({ type: BUY_CHALLENGE_FAILED, payload: { error } });
    toast.error(`Buy challenge ERROR!`);
  }
};

export const validateChallenge = validateData => async dispatch => {
  try {
    const response = await postValidateChallenge(validateData);
    const validation = response.data.challenge_validation;
    const { challenge_subscription } = validation;

    dispatch({
      type: VALIDATE_CHALLENGE_SUCCESS,
      payload: { challengeSubscription: challenge_subscription },
    });

    toast.success(`Validate challenge success!`);
    dispatchFireworks();
  } catch (error) {
    dispatch({ type: VALIDATE_CHALLENGE_FAILED, payload: { error } });
    toast.error(`Validate challenge ERROR!`);
  }
};

export const closeChallenge = subscriptionID => async dispatch => {
  try {
    const response = await postCloseChallenge(subscriptionID);
    dispatch({
      type: CLOSE_CHALLENGE_SUCCESS,
      payload: { challengeSubscription: response.data.challenge_subscription },
    });

    toast.success(`Close challenge success!`);
  } catch (error) {
    dispatch({ type: CLOSE_CHALLENGE_FAILED, payload: { error } });
    toast.error(`Close challenge ERROR!`);
  }
};

