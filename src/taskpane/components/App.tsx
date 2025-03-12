import * as React from "react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import TextInsertion from "./TextInsertion";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { insertText } from "../taskpane";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    height: "100vh", // Use full viewport height
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Prevent scrolling of the entire app
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    overflow: "hidden", // Prevent content scrolling
  },
  heroListContainer: {
    padding: "20px 20px 10px 20px",
    flexShrink: 0, // Prevent hero list from shrinking
  },
  textInsertionContainer: {
    padding: "0 20px 20px 20px",
    flex: "1 1 auto", // Allow text insertion to grow and fill available space
    display: "flex",
    minHeight: 0, // Important for proper flex behavior
  }
});

const App: React.FC<AppProps> = (props: AppProps) => {
  const styles = useStyles();
  const listItems: HeroListItem[] = [
    {
      icon: <Ribbon24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Achieve more with Office integration",
    },
    {
      icon: <LockOpen24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Unlock features with Local LLMs",
    },
    {
      icon: <DesignIdeas24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Build AI Feature with Local LLM faster",
    }
  ];

  return (
    <div className={styles.root}>
      <Header
        logo="assets/icons8-microsoft-copilot-32.png"
        title={props.title}
        message="Local LLM Playground"
      />
      <div className={styles.content}>
        <div className={styles.heroListContainer}>
          <HeroList
            message="Discover what local Pilot can do for you today!"
            items={listItems}
          />
        </div>
        <div className={styles.textInsertionContainer}>
          <TextInsertion insertText={insertText} />
        </div>
      </div>
    </div>
  );
};

export default App;