import * as React from "react";
import { tokens, makeStyles } from "@fluentui/react-components";

export interface HeroListItem {
  icon: React.JSX.Element;
  primaryText: string;
}

export interface HeroListProps {
  message: string;
  items: HeroListItem[];
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: "4px",
    padding: "16px",
  },
  header: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "8px",
    transition: "background-color 0.1s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  icon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground1,
    margin: 0,
    lineHeight: "20px",
  }
});

const HeroList: React.FC<HeroListProps> = (props: HeroListProps) => {
  const { items, message } = props;
  const styles = useStyles();

  const listItems = items.map((item, index) => (
    <li className={styles.listItem} key={index}>
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.itemText}>{item.primaryText}</span>
    </li>
  ));

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>{message}</h2>
      <ul className={styles.list}>{listItems}</ul>
    </div>
  );
};

export default HeroList;
