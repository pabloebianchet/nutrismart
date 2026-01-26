import { useState } from "react";
import UserDataFormStyled from "../components/UserDataFormStyled";
import ImageCaptureStep from "../components/ImageCaptureStep";
import ResultScreen from "../components/ResultScreen"; // este lo haremos luego

const NutriWizard = () => {
  const [step, setStep] = useState(1);

  const handleUserDataSubmit = (data) => {
    // Guardar los datos en el context
    // Luego pasar al paso 2
    setStep(2);
  };

  const handleImagesReady = () => {
    // Ya tiene imágenes -> ir al paso de análisis IA
    setStep(3);
  };

  return (
    <>
      {step === 1 && <UserDataFormStyled onSubmit={handleUserDataSubmit} />}
      {step === 2 && <ImageCaptureStep onNext={handleImagesReady} />}
      {step === 3 && <ResultScreen />} {/* <-- se implementa después */}
    </>
  );
};

export default NutriWizard;
