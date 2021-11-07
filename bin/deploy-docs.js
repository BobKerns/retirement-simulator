#!/usr/bin/env node
/*
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/retirement-simulator
 */

/**
 * This file handles documentation releases. In the context of a github release workflow,
 * it expects the `gh-pages` branch to be checked out into `build/gh-pages`. The generated API
 * documentation will be installed into `build/gh-pages/docs/{`_tag_`}/api`, and the site glue
 * will be updated with appropriate links.
 *
 * We do a bit of shuffling:
 * * The project `CHANGELOG.md` is at the global (top) in the target.
 * * The project `README.md` is versioned to each release tag, and the most
 *   recent one is also put at top level.
 *
 * They are converted to HTML, and links adjusted accordingly.
 *
 * The `observablehq/` directory is copied to the release tag, and its README.md
 * is translated to HTML.
 *
 * When run locally, the results are not checked in, but are left in `build/gh-pages`
 * for inspection.
 * @module
 */

const pkg = require('../package.json');
const github = process.env['GITHUB_WORKSPACE'];
const PROJECT = 'retirement-simulator';

const VERSION = pkg.version;
const TAG = github ? `v${VERSION}` : 'local';

const fs = require('fs/promises');
const util = require('util');
const copyFile = fs.copyFile;
const readdir = fs.readdir;
const mkdir = async d => {
    try {
        await fs.mkdir(d);
        console.log(`Created: ${d}`);
    } catch (e) {
        if (e.code === 'EEXIST') {
            // already exists.
            console.log(`Exists: ${d}`)
        } else {
            throw e;
        }
    }
    return d;
}
const readFile = async f => fs.readFile(f, 'utf8');
const writeFile = async (f, data) => fs.writeFile(f, data, 'utf8');

const path = require('path');
const join = path.join;
const resolve = path.resolve;
const dirname = path.dirname;
const basename = path.basename;

const child_process = require('child_process');
const execFile = util.promisify(child_process.execFile);

const hljs = require('highlight.js');

const fetchPkg = import('node-fetch');
const fetch = async (...args) => (await fetchPkg).default(...args);

/**
 * The root of our repo
 * @type {string}
 */
const ROOT = join(process.mainModule.path, '..');

// Point this to where we checked out the gh-pages branch.
const DOCS = join(ROOT, 'build/gh-pages');

const SITEBASE =
    github
        ? `/${PROJECT}/`
        : '/';

const DOCBASE = `${SITEBASE}docs`;
const mkexec = wd => async (cmd, ...args) => {
    const { stdout, stderr } = await execFile(cmd, args, { cwd: wd });
    stderr && process.stderr.write(stderr);
    stdout && process.stdout.write(stdout);
};
const mkexecRead = wd => async (cmd, ...args) => {
    const { stdout, stderr } = await execFile(cmd, args, { cwd: wd });
    stderr && process.stderr.write(stderr);
    return stdout;
};

const exec = mkexec(DOCS);
const rootExec = mkexec(ROOT);
const rootExecRead = mkexecRead(ROOT);

const marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        return hljs.highlight(code, {language: validLanguage}).value;
    },
    gfm: true,
});
const renderer = {
    link(href, title, text) {
        const rewrite = () => {
            if (href.match(/(?:\.\/)?README.md$/)) {
                return `${DOCBASE}/${TAG}/README.html`;
            } else if (href.match(/(?:\.\/)?CHANGELOG.md$/)) {
                return `${DOCBASE}/CHANGELOG.html`;
            }
            return href.replace(/\.md$/i, '.html');
        };
        const nHref = rewrite(href);
        console.log('link', href, title, text, nHref);
        return`<a href=${nHref} ${title ? `title="${title}"` : ''}>${text}</a>`;
    }
};

marked.use({renderer });

const copy = async (from, to) => {
    const dir = dirname(to);
    await mkdir(dir);
    await copyFile(from, to);
}


const html = (title, body) => `<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@10.5.0/styles/xcode.css" integrity="sha256-OI7B0pICACICPVbs30FdQ/l6qL8TnsfhyGAdg5m5NzQ=" crossorigin="anonymous">
</head>
<body>${body}</body>
</html>`;

const convert = async (from, to, title) => {
    console.log('Converting', from, to);
    const dir = dirname(to);
    const fname = basename(to).replace(/\.md$/i, '.html');
    const htmlFile = join(dir, fname);
    await mkdir(dir);
    const content = await readFile(from);
    return await convertContent(content, htmlFile, title);
};

const convertContent = async (content, htmlFile, title) => {
    const extractTitle = () => {
        const t1 = content.match(/^# (.*)$/m);
        return t1 ? t1[1] : basename(htmlFile, '.html');
    }
    title = title || extractTitle();
    const dir = dirname(htmlFile);
    await mkdir(dir);
    const xFormed = marked(content);
    console.log(`Writing: ${htmlFile} (${title})`);
    await writeFile(htmlFile, html(title, xFormed));
    return htmlFile;
};

const releases = async () =>
    (await (await fetch(`https://api.github.com/repos/BobKerns/${PROJECT}/releases`))
        .json())
        .filter(e => e.published_at > '2020-05-29T18:25:38Z')
        .map(r => `* [${r.name}](https://bobkerns.github.io/${PROJECT}/docs/${r.tag_name}/api/index.html) ${r.prerelease ? ' (prerelease)' : ''}`)
        .join('\n');

const Throw = m => {
    throw new Error(m);
};

const thisRelease = async(tag) =>
    github ?
        (await (await fetch(`https://api.github.com/repos/BobKerns/${PROJECT}/releases`))
            .json())
            .filter(e => e.tag_name === tag)
            [0] || Throw(`No release tagged ${tag} found.`)
        : {name: 'Local Build', body: 'Local build'} // fake release

const hasDocdest = async () => {
    const worktrees = await rootExecRead('git', 'worktree', 'list', '--porcelain');
    return /\/build\/gh-pages/m.test(worktrees);
};

const run = async () => {
    await rootExec('git', 'remote', '-v');
    await rootExec('git', 'fetch', 'origin', 'gh-pages');
    if (await hasDocdest()) {
        await rootExec('git', 'worktree', 'remove', '--force', 'build/gh-pages');
    }
    await rootExec('git', 'worktree', 'add', 'build/gh-pages', 'refs/remotes/origin/gh-pages');
    const source = join(ROOT, 'build', 'docs');
    const docs = join(DOCS, 'docs');
    const target = join(docs, TAG);

    process.stdout.write(`GITHUB_WORKSPACE: ${github}\n`);
    process.stdout.write(`ROOT: ${ROOT}\n`);
    process.stdout.write(`DOCS: ${DOCS}\n`);
    process.stdout.write(`docs: ${docs}\n`);
    process.stdout.write(`SITEBASE: ${SITEBASE}\n`);
    process.stdout.write(`DOCBASE: ${DOCBASE}\n`);
    process.stdout.write(`Destination: ${target}\n`);
    await mkdir(DOCS);
    await mkdir(docs);
    await mkdir(target);
    await Promise.all([
        ['CHANGELOG.md', 'Change Log'],
        ['CODE_OF_CONDUCT.md', 'Code of Conduct'],
        ['CODE_OF_CONDUCT.md', 'Code of Conduct', join(target, 'CODE_OF_CONDUCT.html')],
        ['CODE_OF_CONDUCT.md', 'Code of Conduct', join(DOCS, 'CODE_OF_CONDUCT.html')],
        ['CONTRIBUTING.md', "Contributor's guide."],
        ['CONTRIBUTING.md', "Contributor's guide.", join(target, 'CONTRIBUTING.html')],
        ['CONTRIBUTING.md', "Contributor's guide.", join(DOCS, 'CONTRIBUTING.html')],
        ['README.md', `Retirement Simulator`],
        ['README.md', `Retirement Simulator`, join(target, 'README.html')],
        ['assets/landing.md', 'Retirement Simulator', join(DOCS, 'index.md')]
    ].map(([f, title, f2]) =>
        convert(join(ROOT, f), f2 || join(docs, f), title)));
    const release_body = await releases();
    const release_page = `# Retirement Simulator (retirement-simulator) release documentation
${!github ? `* [local](http://localhost:3035/docs/local/index.html)` : ``}
* [CHANGELOG](./CHANGELOG.html)
${release_body}`;
    await convertContent(release_page, join(docs, 'index.html'), "Retirement Simulator Releases");
    const release = await thisRelease(TAG);
    const release_landing = `# ${release.name}

${release.body || ''}
----
* [API documentation](api/index.html)
* [CHANGELOG](../CHANGELOG.html)
* [GitHub](https://github.com/BobKerns/${PROJECT}.git)
* [GitHub ${TAG} tree](https://github.com/BobKerns/${PROJECT}.git/tree/${TAG}/)
* [Releases](https://bobkerns.github.io/${PROJECT}/docs/)
`;
    await convertContent(release_landing, join(target, 'index.html'), release.name);
    const copyTree = async (from, to) => {
        const dir = await readdir(resolve(ROOT, from), {withFileTypes: true});
        return  Promise.all(dir.map(d =>
            d.isFile()
                ? d.name.endsWith('.md')
                ? convert(join(from, d.name), join(to, d.name.replace(/\.md$/, '.html')))
                : copyFile(join(from, d.name), join(to, d.name))
                : d.isDirectory()
                ? Promise.resolve(join(to, d.name))
                    .then(mkdir)
                    .then(t => copyTree(join(from, d.name), t))
                : Promise.resolve(null)));
    }
    await copyTree(source, target);
    // Only check in as part of the packaging workflow.
    if (github) {
        await exec('git', 'config', 'user.email', '1154903+BobKerns@users.noreply.github.com');
        await exec('git', 'config', 'user.name', 'ReleaseBot');
        await exec('git', 'add', 'index.html');
        await exec('git', 'add', target);
        await exec('git', 'add', 'docs/index.html');
        await exec('git', 'add', 'docs/CHANGELOG.html');
        await exec('git', 'commit', '-m', `Deploy documentation for ${TAG}.`);
        await exec('git', 'push', 'origin', 'HEAD:gh-pages');
    }
}
run().catch(e => {
    process.stderr.write(`Error: ${e.message}\n${e.stack}`);
    process.exit(-128);
});
