import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TransferForm() {
  const [formData, setFormData] = useState({ name: '', iban: '', country: '', amount: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const [fee, setFee] = useState(null); // Kesinti miktarı
  const [netAmount, setNetAmount] = useState(null); // Net USD tutarı
  const [estimatedTime] = useState('~5 dakika');
  const navigate = useNavigate();

  // API'den döviz kuru çekme (exchangerate-api.com)
  useEffect(() => {
    if (formData.country) {
      fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('API Response:', data);
          const rate = data.rates[formData.country];
          setExchangeRate(rate ? rate.toFixed(2) : 'Bilinmiyor');
          if (rate && formData.amount) {
            const amount = parseFloat(formData.amount);
            const fixedFee = 5; // Sabit 5 USD ücret
            const commission = amount * 0.01; // %1 komisyon
            const totalFee = fixedFee + commission;
            const net = amount - totalFee;
            setFee(totalFee.toFixed(2));
            setNetAmount(net.toFixed(2));
            setCalculatedAmount((net * rate).toFixed(2));
          } else {
            setFee(null);
            setNetAmount(null);
            setCalculatedAmount(null);
          }
        })
        .catch((error) => {
          console.error('API Error:', error);
          setExchangeRate('Hata: Kur alınamadı');
          setFee(null);
          setNetAmount(null);
          setCalculatedAmount(null);
        });
    }
  }, [formData.country, formData.amount]);

  // Form doğrulama
  const validateForm = () => {
    const newErrors = {};
    // Alıcı adı: Sadece harf ve boşluk
    if (!formData.name) {
      newErrors.name = 'Alıcı adı gerekli.';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Alıcı adı sadece harf ve boşluk içerebilir.';
    }
    // IBAN: Basit format kontrolü
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(formData.iban)) {
      newErrors.iban = 'Geçerli bir IBAN girin (örn. TR33...).';
    }
    // Ülke seçimi
    if (!formData.country) {
      newErrors.country = 'Ülke seçimi gerekli.';
    }
    // Ülke-döviz uyumluluğu
    if (formData.country && exchangeRate === 'Bilinmiyor') {
      newErrors.country = 'Seçilen ülke için döviz kuru bulunamadı.';
    }
    // Miktar: Pozitif sayı
    if (!formData.amount) {
      newErrors.amount = 'Transfer miktarı gerekli.';
    } else if (isNaN(formData.amount) || formData.amount <= 0) {
      newErrors.amount = 'Geçerli bir pozitif sayı girin.';
    }
    // Kesinti sonrası net tutar kontrolü
    if (formData.amount && parseFloat(formData.amount) <= 5) {
      newErrors.amount = 'Miktar, kesintilerden sonra sıfır veya negatif olamaz.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/confirmation', { state: { formData, exchangeRate, calculatedAmount, fee, netAmount, estimatedTime } });
    }, 2000);
  };

  return (
    <div className="form-container">
      <h2>Para Transferi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Alıcı Adı</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Ali Yılmaz"
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label>IBAN</label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
            placeholder="Örn: TR330006100000000012345678"
          />
          {errors.iban && <p className="error">{errors.iban}</p>}
        </div>
        <div className="form-group">
          <label>Ülke</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          >
            <option value="">Ülke Seçin</option>
            <option value="EUR">Avrupa (EUR)</option>
            <option value="GBP">Birleşik Krallık (GBP)</option>
            <option value="USD">ABD (USD)</option>
            <option value="TRY">Türkiye (TRY)</option>
          </select>
          {errors.country && <p className="error">{errors.country}</p>}
        </div>
        <div className="form-group">
          <label>Transfer Miktarı (USD)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Örn: 100"
            min="0"
          />
          {errors.amount && <p className="error">{errors.amount}</p>}
        </div>
        {exchangeRate && (
          <p className="info">Döviz Kuru: 1 USD = {exchangeRate} {formData.country}</p>
        )}
        {fee && (
          <p className="info">Kesinti: {fee} USD (5 USD sabit + %1 komisyon)</p>
        )}
        {netAmount && (
          <p className="info">Net Gönderilen: {netAmount} USD</p>
        )}
        {calculatedAmount && (
          <p className="calculated-amount">
            Alıcıya Ulaşacak: {calculatedAmount} {formData.country}
          </p>
        )}
        {estimatedTime && <p className="info">Tahmini İşlem Süresi: {estimatedTime}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="loading">İşleniyor...</span>
          ) : (
            'Gönder'
          )}
        </button>
      </form>
    </div>
  );
}

export default TransferForm; 