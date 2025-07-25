import en from './en.json';
import fr from './fr.json';
import swatfr from './swat_fr.json';

const messages = {
    en: en,
    fr: { ...fr, ...swatfr },
};

export default messages;
