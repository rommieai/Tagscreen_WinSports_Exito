import { useEffect } from "react";
import useAppContextPopUp from "@/app/context/ContextPopUp";

const useNewAnswer = (answer, preguntas) => {
  const { setConversation, conversacion, setCurrentQuestion, currentQuestion } =
    useAppContextPopUp();

  useEffect(() => {
    setConversation((prevConversation) => [
      ...prevConversation,
      {
        pregunta: preguntas[currentQuestion].question,
        answer,
        duration: preguntas[currentQuestion].duration,
      },
    ]);

    setCurrentQuestion((prevCurrentQuestion) => prevCurrentQuestion + 1);

    const timer = setTimeout(() => {
      scrollToBottom(); // Asume que scrollToBottom está definido en otro lugar de tu aplicación
    }, 200);

    return () => clearTimeout(timer); // Limpieza del timeout cuando el componente se desmonta
  }, [answer, currentQuestion, preguntas, setConversation, setCurrentQuestion]);

  return true;
};

export default useNewAnswer;
