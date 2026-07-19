const defaultRepo = "lanhui844-sudo/moonherb";

function sendJson(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function encodeBase64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeBase64(value) {
  return Buffer.from(value.replace(/\n/g, ""), "base64").toString("utf8");
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Missing GITHUB_TOKEN");

  return fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
}

export default async function handler(request, response) {
  if (!process.env.ADMIN_PASSWORD) {
    sendJson(response, 500, { error: "Missing ADMIN_PASSWORD" });
    return;
  }

  const password = request.headers["x-admin-password"];
  if (password !== process.env.ADMIN_PASSWORD) {
    sendJson(response, 401, { error: "后台密码不对。" });
    return;
  }

  const repo = process.env.GITHUB_REPO || defaultRepo;
  const branch = process.env.GITHUB_BRANCH || "main";
  const contentPath = "data/content.json";
  const filePath = `/repos/${repo}/contents/${contentPath}`;

  try {
    if (request.method === "GET") {
      const githubResponse = await githubRequest(`${filePath}?ref=${branch}`);
      if (!githubResponse.ok) {
        sendJson(response, githubResponse.status, { error: "读取内容失败。" });
        return;
      }
      const file = await githubResponse.json();
      sendJson(response, 200, {
        content: JSON.parse(decodeBase64(file.content)),
        sha: file.sha,
      });
      return;
    }

    if (request.method === "PUT") {
      const rawBody = await readRequestBody(request);
      const body = JSON.parse(rawBody || "{}");
      const nextContent = body.content;
      if (!nextContent || typeof nextContent !== "object") {
        sendJson(response, 400, { error: "保存内容格式不对。" });
        return;
      }

      const currentResponse = await githubRequest(`${filePath}?ref=${branch}`);
      if (!currentResponse.ok) {
        sendJson(response, currentResponse.status, { error: "读取当前文件失败。" });
        return;
      }
      const currentFile = await currentResponse.json();
      const updateResponse = await githubRequest(filePath, {
        method: "PUT",
        body: JSON.stringify({
          message: "Update moonherb content from Vercel studio",
          content: encodeBase64(JSON.stringify(nextContent, null, 2)),
          sha: currentFile.sha,
          branch,
        }),
      });

      if (!updateResponse.ok) {
        sendJson(response, updateResponse.status, { error: "保存到 GitHub 失败。" });
        return;
      }
      const updatedFile = await updateResponse.json();
      sendJson(response, 200, { content: nextContent, sha: updatedFile.content.sha });
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "后台接口出错。" });
  }
}
