import React from "react";
import { Card, Table } from "tabler-react";

// import styles from "./style.module.css";
import { FormattedMessage } from "react-intl";
import {Link} from "gatsby";
import {useTheme} from "emotion-theming";

const TeamsOnOrganizationRow = ({ teams }) => {
  const currentTheme = useTheme();

  return teams.map((item, idx) => {
    item.cash = item.cash ? item.cash : 0;
    item.score = item.score ? item.score : 0;
    return (
      <Table.Row key={item.id}>
        <Table.Col alignContent="center">
          <Link
            className="link"
            to={"/team/" + item.id}
            activeStyle={{
              fontWeight: "bold",
              color: currentTheme.colors.primary,
            }}
          >
            {item.season.name}
          </Link>
        </Table.Col>
        <Table.Col alignContent="center">
          {item.score}
        </Table.Col>
        <Table.Col alignContent="center">
          ${item.cash}
        </Table.Col>
      </Table.Row>
    );
  });
}

const TeamsOnOrganizationList = ({ teams, limit }) => {
  if (teams !== undefined && limit !== undefined && !isNaN(limit)) {
    teams = teams.slice(0, limit);
  }
  return (
    <Card>
      <Table
        striped={true}
        responsive={true}
        verticalAlign="center"
        className="mb-0"
      >
        <Table.Header>
          <Table.Row>
            <Table.ColHeader alignContent="center">
              <FormattedMessage id="AllTeamsOnOrganization.season" />
            </Table.ColHeader>
            <Table.ColHeader alignContent="center">
              <FormattedMessage id="AllTeamsOnOrganization.score" />
            </Table.ColHeader>
            <Table.ColHeader alignContent="center">
              <FormattedMessage id="AllTeamsOnOrganization.cash" />
            </Table.ColHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teams && (
            <TeamsOnOrganizationRow teams={teams} />
          )}
        </Table.Body>
      </Table>
    </Card>
  );
};

export default TeamsOnOrganizationList;
