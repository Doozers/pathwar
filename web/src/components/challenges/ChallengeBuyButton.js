import React from "react";
import { Button } from "tabler-react";

const ChallengeBuyButton = ({ challenge, buyChallenge, isClosed, ...rest }) => {
  const hasSubscriptions = challenge.subscriptions;

  const handleBuyChallenge = async event => {
    event.preventDefault();
    await buyChallenge(challenge.flavor_id, challenge.season_id);
  };

  return (
    <Button
      icon={hasSubscriptions ? "check" : "dollar-sign"}
      color="indigo"
      disabled={hasSubscriptions || isClosed}
      onClick={handleBuyChallenge}
      {...rest}
    >
      {hasSubscriptions ? "Purchased" : "Buy"}
    </Button>
  );
};

export default ChallengeBuyButton;
