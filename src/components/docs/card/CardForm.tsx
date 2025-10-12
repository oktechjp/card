import type { OptionGroup } from "@/components/form/OptionGroup";
import type { DocForm } from "@/components/safeDoc-react";
import { InputWithLabel } from "@/components/form/InputWithLabel";
import { SelectWithLabel } from "@/components/form/SelectWithLabel";
import { SelectGroupWithLabel } from "@/components/form/SelectGroupWithLabel";
import { ColorEnum, CountryGroups, DEFAULT_COLOR } from "@/docs/card";
import { ColorInfo } from "@/components/docs/card/ColorInfo";

export const CardForm: DocForm = () => (
  <>
    <fieldset>
      <legend>Front Side</legend>
      <InputWithLabel name="surname" label="Surname">
        Enter your surname, the name you expect to be used with ”様" in your
        language.
        <br />
        Your surname is not required but strongly recommended. <br />
        Example: <em>"Smith"</em>, <em>"田中"</em>, <em>"남궁"</em>,{" "}
        <em>"張"</em>, <em>"Öttner"</em>
      </InputWithLabel>
      <InputWithLabel name="surname_kana" label="Surname Kana">
        Enter your surname as you expect it to be pronounced in katakana.
        <br />
        Except when your name is Japanese, in which case, please enter it using
        the{" "}
        <a
          href="https://ja.wikipedia.org/wiki/%E3%83%98%E3%83%9C%E3%83%B3%E5%BC%8F%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97"
          target="_blank"
        >
          Hepburn conversion
        </a>
        .<br />
        Helpers for some languages:{" "}
        <a
          href="https://japanesenameconverter.nolanlawson.com/#?q=Michael"
          target="_blank"
        >
          English
        </a>
        ,{" "}
        <a href="https://namehenkan.com/" target="_blank">
          中文
        </a>
        ,{" "}
        <a
          href="https://www.ltool.net/korean-hangul-names-to-katakana-and-hiragana-in-korean.php#google_vignette"
          target="_blank"
        >
          한국인
        </a>
        ,{" "}
        <a
          href="https://langues-asiatiques.com/apprenez-a-ecrire-votre-prenom-et-nom-en-japonais/"
          target="_blank"
        >
          Français
        </a>
        ,{" "}
        <a
          href="https://nihon-go.ru/imya-na-yaponskom-yazyike/"
          target="_blank"
        >
          Русский
        </a>
        ,{" "}
        <a
          href="https://zenmarket.jp/ar/blog/post/12873/japanese-katakana"
          target="_blank"
        >
          عربي
        </a>
        ,{" "}
        <a
          href="https://skdesu.com/th/%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9E%E0%B8%B9%E0%B8%94%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD/"
          target="_blank"
        >
          ภาษาไทย
        </a>
        ,{" "}
        <a
          href="https://www.berakal.com/cara-mengubah-nama-ke-tulisan-jepang/"
          target="_blank"
        >
          Indonesia
        </a>
        ,{" "}
        <a
          href="https://japonesafondo.com/articulos/tu-nombre-en-japones/"
          target="_blank"
        >
          Español
        </a>
        ,{" "}
        <a
          href="http://www.junko.de/japanisch/94-namen-auf-japanisch.html"
          target="_blank"
        >
          Deutsch
        </a>
        ,{" "}
        <a
          href="https://digitalkw.com/it/convertitore-nome-giapponese/"
          target="_blank"
        >
          Italiano
        </a>
      </InputWithLabel>
      <InputWithLabel name="firstname" label="Firstname">
        Enter your first name like your surname, here you can also add any
        middle name you find appropriate such as <em>"Francis Scott Key"</em>.
      </InputWithLabel>
      <InputWithLabel name="firstname_kana" label="Firstname Kana" />
      <InputWithLabel name="subtitle" label="Subtitle">
        Optionally, describe yourself briefly. How do you want to be seen?
        <br />
        Example: <em>"Programmer"</em>, <em>"Designer"</em>,{" "}
        <em>"Product Manager/Consultant"</em>
      </InputWithLabel>
      <InputWithLabel name="email" label="Email">
        Your email address is optional. You can also use a Line ID or another
        identifier if you wish, though email is often the most appropriate.
      </InputWithLabel>
      <InputWithLabel name="url" label="URL" size={45}>
        Optionally as second line to be added. Often your personal homepage is a
        good idea.
      </InputWithLabel>
      <InputWithLabel name="description" label="Description" size={45}>
        Extra line in the bottom. Can be used for a useful line that describes
        you in english. <br />
        Martin uses it to make sure that people don't mistake him as Australian:
        <br />
        Example: <em>"Austrian in Osaka"</em>
      </InputWithLabel>
      <SelectGroupWithLabel
        groups={CountryGroups as OptionGroup[]}
        name="bottom1"
        label="Icon A"
      >
        You can add one of the icons if you feel like it. They are completely
        optional and{" "}
        <a
          href="https://github.com/oktechjp/card/edit/main/src/docs/card/icons.ts"
          target="_blank"
        >
          a PR is welcome
        </a>{" "}
        for adding new Icons that you like.
      </SelectGroupWithLabel>
      <SelectGroupWithLabel
        groups={CountryGroups as OptionGroup[]}
        name="bottom2"
        label="Icon B"
      >
        Additional Icon that you can use if you feel like it.
      </SelectGroupWithLabel>
    </fieldset>
    <fieldset>
      <legend>Back Side</legend>
      <SelectGroupWithLabel
        name="color"
        label="Color"
        defaultValue={DEFAULT_COLOR}
        groups={[
          {
            name: "Colors",
            entries: Object.keys(ColorEnum).reduce(
              (result, key) => {
                result[key] = ColorInfo[key as keyof typeof ColorInfo].label;
                return result;
              },
              {} as { [key: string]: string },
            ),
          },
        ]}
      >
        Choose any color you like. The colors are defined by our designer but
        should only represent your preference they do not have any further
        meaning.
      </SelectGroupWithLabel>
      <InputWithLabel name="callname" label="Callname">
        (Strongly recommended) The name you want to be called with during
        meanings in latin letters.
        <br />
        Example: <em>"Yosuke"</em>, <em>"Chrissi"</em>, <em>"Mike"</em>,{" "}
        <em>"Jhonny"</em>
      </InputWithLabel>
      <InputWithLabel name="callname_kana" label="Callname Kana">
        (Strongly recommended) The name in katakana (or hiragana for japanese
        names) how you want to be called. This is to make it easier for people
        to pronounce your name. <br />
        Example: <em>よすけ</em>, <em>クリシー</em>, <em>マイク</em>,{" "}
        <em>ジャニー</em>
      </InputWithLabel>
    </fieldset>
  </>
);
