import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
function context(workspace, ...dependencies) {
  let require = createRequire(join(root, workspace, "package.json"));
  for (const dependency of dependencies) require = createRequire(require.resolve(dependency));
  return require;
}
const docs = context("apps/docs", "blume");
const cli = context("apps/storybook-native", "expo", "@expo/cli");
const certificates = context(
  "apps/storybook-native",
  "expo",
  "@expo/cli",
  "@expo/code-signing-certificates",
);
const glob = context("packages/ui", "shadcn", "fast-glob");
const micromatch = context("packages/ui", "shadcn", "fast-glob", "micromatch");
const braces = micromatch("braces");
const forge = certificates("node-forge");

test("all affected dependency copies resolve to fixed versions or reviewed local patches", () => {
  const lock = parse(readFileSync(join(root, "pnpm-lock.yaml"), "utf8"));
  const minimums = {
    uuid: [11, 1, 1],
    katex: [0, 18, 2],
    "postcss-selector-parser": [7, 1, 6],
    esbuild: [0, 28, 1],
    "path-to-regexp": [6, 3, 0],
  };
  for (const key of Object.keys(lock.packages)) {
    const match = key.match(
      /^(uuid|katex|postcss-selector-parser|esbuild|path-to-regexp)@(\d+)\.(\d+)\.(\d+)/,
    );
    if (!match) continue;
    const version = match.slice(2).map(Number);
    const minimum = minimums[match[1]];
    const difference =
      version.map((value, i) => value - minimum[i]).find((value) => value !== 0) ?? 0;
    assert.ok(difference >= 0, `${key} remains vulnerable`);
  }
  assert.ok(!Object.keys(lock.packages).some((key) => key.startsWith("sprintf-js@")));
  for (const dependency of ["node-forge@1.4.0", "braces@3.0.3"]) {
    assert.match(
      lock.patchedDependencies?.[dependency] ?? "",
      /^[a-f0-9]{64}$/,
      `${dependency} must keep its patch`,
    );
  }
});

test("braces rejects excessive brace, parenthesis and mixed nesting before recursive work", () => {
  const patterns = [
    "{".repeat(4200) + "a" + "}".repeat(4200),
    "(".repeat(4200) + "a" + ")".repeat(4200),
    "{(".repeat(100) + "a" + ")}".repeat(100),
    "{".repeat(129),
  ];
  for (const pattern of patterns) {
    for (const method of ["parse", "compile", "expand", "stringify"]) {
      assert.throws(() => braces[method](pattern), {
        name: "SyntaxError",
        message: /nesting depth/,
      });
    }
  }
  assert.throws(() => glob("micromatch").braceExpand(patterns[0]), {
    name: "SyntaxError",
    message: /nesting depth/,
  });
});

test("braces guards direct AST inputs and both child and parent cycles", () => {
  const script = `const assert = require('node:assert/strict');
const braces = require(${JSON.stringify(micromatch.resolve("braces"))});
for (const method of ['compile', 'expand', 'stringify']) {
  const deep = { type: 'root', nodes: [] }; let tail = deep;
  for (let i = 0; i < 130; i++) { const next = { type: 'root', nodes: [] }; tail.nodes.push(next); tail = next; }
  const childCycle = { type: 'root', nodes: [] }; childCycle.nodes.push(childCycle);
  const parentCycle = { type: 'root', nodes: [] }; parentCycle.parent = parentCycle;
  for (const ast of [deep, childCycle, parentCycle]) assert.throws(() => braces[method](ast), { name: 'SyntaxError', message: /nesting depth/ });
}`;
  const result = spawnSync(process.execPath, ["-e", script], { encoding: "utf8", timeout: 3000 });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test("braces preserves normal glob expansion, literal delimiters and partial ASTs", () => {
  assert.deepEqual(braces.expand("src/{a,b}/{1..3}.ts"), [
    "src/a/1.ts",
    "src/a/2.ts",
    "src/a/3.ts",
    "src/b/1.ts",
    "src/b/2.ts",
    "src/b/3.ts",
  ]);
  assert.deepEqual(braces.expand("{a,,b,a}", { noempty: true, nodupes: true }), ["a", "b"]);
  assert.equal(braces.compile("src/{a,b}.ts"), "src/(a|b).ts");
  for (const pattern of [
    "{".repeat(128) + "a" + "}".repeat(128),
    "(".repeat(128) + "a" + ")".repeat(128),
  ]) {
    assert.equal(braces.stringify(braces.parse(pattern)), pattern);
  }
  for (const literal of [
    "\\{".repeat(200),
    '"' + "{".repeat(200) + '"',
    "[" + "{".repeat(200) + "]",
  ]) {
    assert.doesNotThrow(() => braces.compile(literal));
  }
  const ast = braces.parse("foo/{a,b}/bar");
  assert.equal(braces.stringify(ast.nodes[2]), "{a,b}");
});

test("RSA verification rejects extra AlgorithmIdentifier elements and nonempty NULL", () => {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
  const { asn1 } = forge;
  const make = (type, value, constructed = false) =>
    asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
  for (const hash of ["sha1", "sha256", "sha512"]) {
    const digest = forge.md[hash]
      .create()
      .update("dependency regression fixture")
      .digest()
      .getBytes();
    for (const withNull of [false, true]) {
      const algorithm = [make(asn1.Type.OID, asn1.oidToDer(forge.oids[hash]).getBytes())];
      if (withNull) algorithm.push(make(asn1.Type.NULL, ""));
      const sign = (elements) =>
        forge.pki.rsa.encrypt(
          asn1
            .toDer(
              make(
                asn1.Type.SEQUENCE,
                [make(asn1.Type.SEQUENCE, elements, true), make(asn1.Type.OCTETSTRING, digest)],
                true,
              ),
            )
            .getBytes(),
          keyPair.privateKey,
          0x01,
        );
      assert.equal(keyPair.publicKey.verify(digest, sign(algorithm)), true);
      assert.equal(keyPair.publicKey.verify("different digest", sign(algorithm)), false);
      for (const extra of [
        make(asn1.Type.OCTETSTRING, "padding"),
        make(asn1.Type.SEQUENCE, [], true),
      ]) {
        assert.throws(
          () => keyPair.publicKey.verify(digest, sign([...algorithm, extra])),
          /DigestInfo/,
        );
      }
      assert.throws(
        () =>
          keyPair.publicKey.verify(digest, sign([algorithm[0], make(asn1.Type.NULL, "padding")])),
        /DigestInfo/,
      );
    }
  }
  assert.equal(
    cli("node-forge"),
    forge,
    "both Expo dependency paths must use the same patched Forge",
  );
});

test("Expo certificate and code-signing workflows keep working", () => {
  const signing = cli("@expo/code-signing-certificates");
  const keys = signing.generateKeyPair();
  const certificate = signing.generateSelfSignedCodeSigningCertificate({
    keyPair: keys,
    validityNotBefore: new Date(Date.now() - 60000),
    validityNotAfter: new Date(Date.now() + 86400000),
    commonName: "Dependency regression fixture",
  });
  const restoredKeys = signing.convertKeyPairPEMToKeyPair(signing.convertKeyPairToPEM(keys));
  const restoredCertificate = signing.convertCertificatePEMToCertificate(
    signing.convertCertificateToCertificatePEM(certificate),
  );
  signing.validateSelfSignedCertificate(restoredCertificate, restoredKeys);
  assert.ok(
    signing.signBufferRSASHA256AndVerify(
      restoredKeys.privateKey,
      restoredCertificate,
      Buffer.from("fixture"),
    ),
  );
  assert.equal(signing.generateCSR(restoredKeys, "Fixture").verify(), true);
});

test("js-yaml v3 retains its library and CLI contracts without sprintf-js", () => {
  const matter = docs("gray-matter");
  const yamlContext = context("apps/docs", "blume", "gray-matter");
  const yaml = yamlContext("js-yaml");
  const binary = join(dirname(yamlContext.resolve("js-yaml")), "bin/js-yaml.js");
  assert.equal(matter("---\ntitle: Fixture\n---\nBody").data.title, "Fixture");
  assert.deepEqual(yaml.safeLoad("answer: 42"), { answer: 42 });
  assert.match(
    execFileSync(process.execPath, [binary, "--help"], { encoding: "utf8" }),
    /--compact/,
  );
  assert.match(
    execFileSync(process.execPath, [binary, "--version"], { encoding: "utf8" }),
    /3\.15\.2/,
  );
  assert.deepEqual(
    JSON.parse(
      execFileSync(process.execPath, [binary, "--compact", "--trace"], {
        input: "answer: 42",
        encoding: "utf8",
      }),
    ),
    { answer: 42 },
  );
  assert.ok(
    JSON.parse(
      execFileSync(process.execPath, [binary, join(root, "pnpm-workspace.yaml")], {
        encoding: "utf8",
      }),
    ).packages,
  );
  const invalidOption = spawnSync(process.execPath, [binary, "--invalid-option"], {
    encoding: "utf8",
  });
  assert.equal(invalidOption.status, 2);
  const invalidYaml = spawnSync(process.execPath, [binary, "--compact"], {
    input: "answer: [",
    encoding: "utf8",
  });
  assert.equal(invalidYaml.status, 1);
});

test("uuid rejects partial buffer writes while xcode IDs remain compatible", () => {
  const xcodeContext = context("apps/storybook-native", "expo", "@expo/config-plugins", "xcode");
  const uuid = xcodeContext("uuid");
  for (const version of ["v3", "v5"]) {
    for (const offset of [-1, 4]) {
      const buffer = new Uint8Array(8).fill(170);
      assert.throws(() => uuid[version]("fixture", uuid[version].DNS, buffer, offset), RangeError);
      assert.ok(buffer.every((value) => value === 170));
    }
  }
  const xcode = context("apps/storybook-native", "expo", "@expo/config-plugins")("xcode");
  const project = xcode.project("fixture.pbxproj");
  project.hash = { project: { objects: { PBXBuildFile: {} } } };
  assert.match(project.generateUuid(), /^[A-F0-9]{24}$/);
});

test("KaTeX ignores inherited trust settings and still renders ordinary math", () => {
  const katex = context("apps/docs", "blume", "mermaid")("katex");
  const options = Object.create({ trust: true });
  const html = katex.renderToString("\\href{javascript:alert(1)}{x}", options);
  assert.ok(!html.includes('href="javascript:'));
  assert.match(katex.renderToString("x^2 + y^2"), /katex/);
});

test("selector parsing and route matching retain their supported syntax", () => {
  const parser = context(
    "apps/docs",
    "blume",
    "@tailwindcss/typography",
  )("postcss-selector-parser");
  const selector = ".a".repeat(10000);
  assert.equal(parser().processSync(selector), selector);
  const routing = context(
    "apps/docs",
    "blume",
    "@astrojs/vercel",
    "@vercel/routing-utils",
  )("path-to-regexp");
  const expression = routing.pathToRegexp("/:a-:b");
  assert.equal(expression.test("/a-b"), true);
  assert.equal(expression.test("/a" + "-a".repeat(8000) + "/a"), false);
});

test("tsup uses the fixed esbuild binary and retains JSX compilation", () => {
  const esbuild = context("packages/ui", "tsup")("esbuild");
  assert.equal(esbuild.version, "0.28.2");
  assert.match(
    esbuild.transformSync("const node = <div />", { loader: "tsx", jsx: "automatic" }).code,
    /jsx/,
  );
});
