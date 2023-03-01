import {
  ACCEPT_ORGANIZATION_INVITATION_FAILED,
  ACCEPT_ORGANIZATION_INVITATION_SUCCESS,
  CREATE_ORGANIZATION_FAILED,
  CREATE_ORGANIZATION_SUCCESS,
  GET_ORGANIZATION_DETAILS_FAILED,
  GET_ORGANIZATION_DETAILS_SUCCESS,
  INVITE_USER_TO_ORGANIZATION_FAILED,
  INVITE_USER_TO_ORGANIZATION_SUCCESS,
  LIST_USER_ORGANIZATIONS_INVITATIONS_FAILED,
  LIST_USER_ORGANIZATIONS_INVITATIONS_SUCCESS,
  REJECT_ORGANIZATION_INVITATION_FAILED,
  REJECT_ORGANIZATION_INVITATION_SUCCESS,
  SET_ACTIVE_ORGANIZATION,
  SET_ORGANIZATIONS_LIST,
  SET_ORGANIZATIONS_LIST_FAILED,
  SET_USER_ORGANIZATIONS_LIST,
} from "../constants/actionTypes";
import {
  getAllOrganizations,
  getOrganizationDetails,
  postAnswerOrganizationInvitation, postCreateOrganization,
  postInviteUserToOrganization
} from "../api/organizations";
import {toast} from "react-toastify";
import {postCreateTeam} from "../api/seasons";

export const setActiveOrganization = teamObjData => async dispatch => {
  dispatch({
    type: SET_ACTIVE_ORGANIZATION,
    payload: { team: teamObjData },
  });
};

export const fetchOrganizationsList = () => async dispatch => {
  try {
    const response = await getAllOrganizations();
    dispatch({
      type: SET_ORGANIZATIONS_LIST,
      payload: { allOrganizationsList: response.data.items },
    });
  } catch (error) {
    dispatch({ type: SET_ORGANIZATIONS_LIST_FAILED, payload: { error } });
  }
};

export const setUserOrganizationsList = organisations => async dispatch => {
  try {
    dispatch({
      type: SET_USER_ORGANIZATIONS_LIST,
      payload: { userOrganizationsList: organisations },
    });
  } catch (error) {
    dispatch({ type: SET_ORGANIZATIONS_LIST_FAILED, payload: { error } });
  }
};

export const fetchOrganizationDetail = organizationID => async dispatch => {
  try {
    const response = await getOrganizationDetails(organizationID);
    dispatch({
      type: GET_ORGANIZATION_DETAILS_SUCCESS,
      payload: { organization: response.data.item },
    });
  } catch (error) {
    dispatch({ type: GET_ORGANIZATION_DETAILS_FAILED, payload: { error } });
  }
};

export const fetchUserOrganizationsInvitations = userOrganizationsInvitations => async dispatch => {
  try {
    dispatch({
      type: LIST_USER_ORGANIZATIONS_INVITATIONS_SUCCESS,
      payload: { userOrganizationsInvitations: userOrganizationsInvitations },
    });
  } catch (error) {
    dispatch({ type: LIST_USER_ORGANIZATIONS_INVITATIONS_FAILED, payload: { error } });
  }
};

export const inviteUserToOrganization = (organizationID, name, organizationName) => async dispatch => {
  try {
    const response = await postInviteUserToOrganization(organizationID, name);
    dispatch({
      type: INVITE_USER_TO_ORGANIZATION_SUCCESS,
      payload: {
        team: response.data,
      },
    });
    toast.success(`invite ${name} to ${organizationName} success!`);
  } catch (error) {
    dispatch({
      type: INVITE_USER_TO_ORGANIZATION_FAILED,
      payload: { error },
    });
    toast.error(`invite ${name} to ${organizationName} fail!`);
  }
};

export const acceptOrganizationInvite = (organizationInviteID, organizationName) => async dispatch => {
  try {
    await postAnswerOrganizationInvitation(organizationInviteID, true);
    dispatch({
      type: ACCEPT_ORGANIZATION_INVITATION_SUCCESS,
      payload: {
        organizationInviteID: organizationInviteID,
      },
    });
    toast.success(`accept invitation to organization ${organizationName} success!`);
  } catch (error) {
    dispatch({
      type: ACCEPT_ORGANIZATION_INVITATION_FAILED,
      payload: { error },
    });
    toast.error(`accept invitation to organization ${organizationName} failed!`);
  }
};

export const rejectOrganizationInvite = (organizationInviteID, organizationName) => async dispatch => {
  try {
    await postAnswerOrganizationInvitation(organizationInviteID, false);
    dispatch({
      type: REJECT_ORGANIZATION_INVITATION_SUCCESS,
      payload: {
        organizationInviteID: organizationInviteID,
      },
    });
    toast.success(`reject invitation to organization ${organizationName} success!`);
  } catch (error) {
    dispatch({
      type: REJECT_ORGANIZATION_INVITATION_FAILED,
      payload: { error },
    });
    toast.error(`reject invitation to organization ${organizationName} failed!`);
  }
};

export const createOrganization = (name, gravatarEmail) => async dispatch => {
  try {
    const response = await postCreateOrganization(name, gravatarEmail);

    dispatch({
      type: CREATE_ORGANIZATION_SUCCESS,
      payload: {
        team: response.data,
      },
    });

    toast.success(`Create organization ${name} success!`);
  } catch (error) {
    dispatch({
      type: CREATE_ORGANIZATION_FAILED,
      payload: { error },
    });

    toast.error(`Create organization ERROR!`);
  }
};
