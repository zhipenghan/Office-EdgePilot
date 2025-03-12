import * as React from "react";
import { tokens, makeStyles } from "@fluentui/react-components";

export interface HeaderProps {
  title: string;
  logo: string;
  message?: string;  // Make message optional
}

const useStyles = makeStyles({
  welcome__header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    padding: "16px 24px",
    backgroundColor: tokens.colorBrandBackground,
    boxShadow: tokens.shadow4,
    minHeight: "32px",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  message: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForegroundOnBrand,
    margin: 0,
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  title: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForegroundOnBrand,
    opacity: 0.8,
    margin: 0,
    lineHeight: "1.2",
  },
  logo: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: "32px",
    height: "32px",
  }
});

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { title } = props;
  const styles = useStyles();

  return (
    <section className={styles.welcome__header}>
      <div className={styles.logo}>
        <img
          src="assets/icons8-microsoft-copilot-32.png"
          alt="Copilot Logo"
          className={styles.logoImg}
        />
      </div>
      <div className={styles.titleContainer}>
        <p className={styles.message}>
          {props.message || "Local LLM Playground"}
        </p>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </section>
  );
};

export default Header;