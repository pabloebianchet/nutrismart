import ImageCaptureStep from "../components/ImageCaptureStep";

const WizardPage = () => {
  const goToNext = () => {
    // cambiar al paso 3 (enviar a IA)
  };

  return <ImageCaptureStep onNext={goToNext} />;
};
