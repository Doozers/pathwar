import * as React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";
import { Page, Grid } from "tabler-react";
import { isNil } from "ramda";
import siteMetaData from "../constants/metadata";
import ChallengeList from "../components/challenges/ChallengeList";

import {
  fetchChallenges as fetchChallengesAction,
  buyChallenge as buyChallengeAction,
} from "../actions/seasons";

class SeasonPage extends React.Component {
  componentDidUpdate(prevProps) {
    const {
      fetchChallengesAction,
      activeSeason,
      activeChallenges,
    } = this.props;

    const { activeSeason: prevActiveSeason } = prevProps;

    if (
      (isNil(prevActiveSeason) && activeSeason) ||
      prevActiveSeason.id === activeSeason.id
    ) {
      if (isNil(activeChallenges)) {
        fetchChallengesAction(activeSeason.id);
      }
    }
  }

  render() {
    const {
      buyChallengeAction,
      activeChallenges,
      challengeListError,
    } = this.props;
    const { title, description } = siteMetaData;

    return (
      <>
        <Helmet>
          <title>{title} - Challenges</title>
          <meta name="description" content={description} />
        </Helmet>
        <Page.Content title="Challenges">
          <Grid.Row>
            <Grid.Col xs={12} sm={12} lg={12}>
              {challengeListError && (
                <h3>Get challenges list error, please try again.</h3>
              )}
              {!challengeListError && (
                <ChallengeList
                  challenges={activeChallenges}
                  buyChallenge={buyChallengeAction}
                />
              )}
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </>
    );
  }
}

SeasonPage.propTypes = {
  seasons: PropTypes.object,
  fetchChallengesAction: PropTypes.func,
};

const mapStateToProps = state => ({
  activeSeason: state.seasons.activeSeason,
  activeChallenges: state.seasons.activeChallenges,
  challengeListError: state.seasons.challengesListError,
});

const mapDispatchToProps = {
  fetchChallengesAction: seasonID => fetchChallengesAction(seasonID),
  buyChallengeAction: (seasonID, teamID) =>
    buyChallengeAction(seasonID, teamID),
};

export default connect(mapStateToProps, mapDispatchToProps)(SeasonPage);