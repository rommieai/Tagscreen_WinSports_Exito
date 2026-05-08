import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router";
import { ResultadoProvider } from "./context/ResultadoContext";
import Home from "./pages/(home)/Home";
import Juego from "./pages/(game)/Juego";
import Onboarding from "./pages/(onboarding)/Onboarding";
import Mock from "./pages/(mock)/Mock";
import Demo from "./pages/(demo)/Demo";
import Vod from "./pages/(vod)/Vod";
import Azteca from "./pages/(azteca)/Azteca";
import css from "@/app.module.css";
import { ActiveComponentsProvider } from "./context/ActiveChatContext";
import { CardModalProvider } from "./context/CardModal";
import { NotificationsProvider } from "./context/Notifications/NotificationsContext";
import ScoreboardProvider from "./context/Scoreboard/ScoreboardProvider";
import { SessionInitializer } from "./components/SessionInitializer";
import { AnalyticsTracker } from "./components/AnalyticsTracker";
import { initTvDetector } from "./lib/mediapipeDetector";

function App() {
  useEffect(() => {
    initTvDetector()
      .then(() => console.log("Modelo ok"))
      .catch((err) =>
        console.warn("Fallo precarga (se intentará de nuevo después)", err),
      );
  }, []);

  return (
    <ResultadoProvider>
      <NotificationsProvider>
        <ActiveComponentsProvider>
          <ScoreboardProvider>
            <CardModalProvider>
              <SessionInitializer />
              <AnalyticsTracker />
              <section className={css.main_app}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  {import.meta.env.VITE_APP_OFF !== "true" && (
                    <>
                      <Route path="/juego" element={<Juego />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/mock" element={<Mock />} />
                      <Route path="/demo" element={<Demo />} />
                      <Route path="/vod" element={<Vod />} />
                      <Route path="/azteca" element={<Azteca />} />
                    </>
                  )}
                </Routes>
              </section>
            </CardModalProvider>
          </ScoreboardProvider>
        </ActiveComponentsProvider>
      </NotificationsProvider>
    </ResultadoProvider>
  );
}

export default App;
