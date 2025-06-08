import { useLocation, useNavigate } from 'react-router-dom';

function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { formData, exchangeRate, calculatedAmount, fee, netAmount, estimatedTime } = state || {};

  return (
    <div className="confirmation-container">
      <h2>Transfer Onayı</h2>
      {formData ? (
        <>
          <p><strong>Alıcı Adı:</strong> {formData.name}</p>
          <p><strong>IBAN:</strong> {formData.iban}</p>
          <p><strong>Ülke:</strong> {formData.country}</p>
          <p><strong>Transfer Miktarı:</strong> {formData.amount} USD</p>
          <p><strong>Kesinti:</strong> {fee} USD (5 USD sabit + %1 komisyon)</p>
          <p><strong>Net Gönderilen:</strong> {netAmount} USD</p>
          <p><strong>Döviz Kuru:</strong> 1 USD = {exchangeRate} {formData.country}</p>
          <p style={{color:'yellow'}}><strong>Alıcıya Ulaşacak:</strong> {calculatedAmount} {formData.country}</p>
          <p><strong>Tahmini Süre:</strong> {estimatedTime}</p>
          <button onClick={() => navigate('/')}>Geri Dön</button>
        </>
      ) : (
        <p>Hata: Transfer bilgileri bulunamadı.</p>
      )}
    </div>
  );
}

export default Confirmation;