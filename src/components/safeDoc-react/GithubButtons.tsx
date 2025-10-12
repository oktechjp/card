import type { SafeDocReactType, PublishButtonProps } from ".";

export type GithubFormatter = (publicKey: string) => {
  repo: string;
  folder: string;
  fileName: string;
  branch?: string;
  baseUrl?: string;
};

export type GithubButtonProps = PublishButtonProps & {
  toUrl: GithubFormatter;
};

export function GithubCreateButton({
  publicKey,
  encrypted,
  children,
  toUrl,
}: GithubButtonProps) {
  let link: string | undefined = undefined;
  if (publicKey && encrypted) {
    const { fileName, repo, folder, branch, baseUrl } = toUrl(publicKey);
    const prCreateURL = new URL(
      `https://${baseUrl ?? "github.com"}/${repo}/new/${branch ?? "main"}/${folder}`,
    );
    prCreateURL.searchParams.append("filename", fileName);
    prCreateURL.searchParams.append(
      "value",
      JSON.stringify(encrypted, null, 2),
    );
    link = prCreateURL.toString();
  }
  return (
    <a href={link} className="button" target="_blank">
      {children}
    </a>
  );
}

export function GithubUpdateButton({
  publicKey,
  encrypted,
  children,
  toUrl,
}: GithubButtonProps) {
  const onClick = () => {
    (async () => {
      const clipboard = globalThis.navigator?.clipboard;
      if (!clipboard || !publicKey || !encrypted) {
        alert("todo");
        return;
      }
      await clipboard.writeText(JSON.stringify(encrypted, null, 2));
      if (
        !confirm(`Github doesnt support pre-filling the changed content. :-(`)
      ) {
        return;
      }
      if (!confirm(`The new content is now in your clipboard!`)) {
        return;
      }
      if (!confirm(`After sending okay we will redirect you to github!`)) {
        return;
      }
      if (!confirm(`Paste the content on the next site into github!`)) {
        return;
      }
      const { baseUrl, repo, branch, folder, fileName } = toUrl(publicKey);
      const prUpdateURL = new URL(
        `https://${baseUrl ?? "github.com"}/${repo}/edit/${branch ?? "main"}/${folder}/${fileName}`,
      );
      prUpdateURL.searchParams.append(
        "value",
        JSON.stringify(encrypted, null, 2),
      );
      window.open(prUpdateURL.toString(), "_blank");
    })().catch((err) => {
      console.log(err);
    });
  };
  return <button onClick={onClick}>{children}</button>;
}

export function createGithubButtons(
  toUrl: GithubFormatter,
): Pick<SafeDocReactType, "PublishButton"> {
  return {
    PublishButton: (props) =>
      props.republish ? (
        <GithubUpdateButton toUrl={toUrl} {...props} />
      ) : (
        <GithubCreateButton toUrl={toUrl} {...props} />
      ),
  };
}
