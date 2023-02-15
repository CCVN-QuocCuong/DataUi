import { useState } from 'react'
import { Stepper, Step } from 'components/Stepper'

import AuthenticationLayout from 'layouts/Authentication'
import './style.css'
import { forgotPasswordSteps } from 'constants/steps'
import { SendEmail } from './SendEmail';
import { ChangePassword } from './ChangePassword';
import { Success } from './Success';

export function ForgotPassword(props) {
  const [step, setStep] = useState(forgotPasswordSteps.sendEmail)

  return (
    <AuthenticationLayout>
      <div className="forgotpw-page">
        <div className="forgotpw-header">
          <span>Forgot</span>
          <span style={{ color: '#BD202D', paddingLeft: '10px' }}>Password</span>
        </div>

        <Stepper className="step-section col-sm-6 offset-3" activeStep={step}>
          <Step></Step>
          <Step></Step>
          <Step></Step>
        </Stepper>
        {step === forgotPasswordSteps.sendEmail && (
          <SendEmail currentStep={setStep} />
        )}

        {step === forgotPasswordSteps.changePassword && (
          <ChangePassword currentStep={setStep} />
        )}

        {step === forgotPasswordSteps.success && (
          <Success currentStep={setStep} />
        )}

      </div>
    </AuthenticationLayout>
  );
};