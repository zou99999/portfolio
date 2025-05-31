import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let xScale, yScale;

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,   
        writable: false,    
        configurable: true    
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
      });

      return ret;
    });
}
  
function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Total lines of code
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Number of files in the codebase
    const numFiles = d3.groups(data, d => d.file).length;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);
  
    // Maximum file length (in lines)
    const fileLengths = d3.rollups(
      data,
      v => d3.max(v, d => d.line),
      d => d.file
    );
    const maxFileLength = d3.max(fileLengths, d => d[1]);
    dl.append('dt').text('Maximum file length (in lines)');
    dl.append('dd').text(maxFileLength);
  
    // Longest file (by length in lines)
    const longestFile = d3.greatest(fileLengths, d => d[1])?.[0];
    dl.append('dt').text('Longest file');
    dl.append('dd').text(longestFile);
  
    // Average file length (in lines)
    const avgFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Average file length (in lines)');
    dl.append('dd').text(avgFileLength.toFixed(2));
  
    // Time of day with most work
    const workByPeriod = d3.rollups(
      data,
      v => v.length,
      d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
    dl.append('dt').text('Most active time of day');
    dl.append('dd').text(maxPeriod.charAt(0).toUpperCase() + maxPeriod.slice(1));
  }
  

  function renderScatterPlot(data, commits) {
    // Step 2.1: Drawing the dots
    const width = 1000;
    const height = 600;
  
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');
  
    // Step 2.2: Adding axes
    const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  
    // Scales
    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

    yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt() // ✅ Step 4.2: Fixing area perception
        .domain([minLines, maxLines])
        .range([2, 30]);
    
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  
    // Step 2.3: Adding horizontal grid lines (draw BEFORE axes)
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);
  
    gridlines.call(
      d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width)
    );
  
    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .attr('class', 'x-axis')
      .call(xAxis);
  
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .attr('class', 'y-axis')
      .call(yAxis);
  
    // Plot dots
    const dots = svg.append('g').attr('class', 'dots');
  
    dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines)) // Step 4.2: Fixing area perception
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
        updateTooltipVisibility(false);
    });

    createBrushSelector(svg);
    svg.selectAll('.dots, .overlay ~ *').raise();

  }

  function updateScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 60 };
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  
    const svg = d3.select('#chart').select('svg');
  
    xScale.domain(d3.extent(commits, (d) => d.datetime));
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
  
    const xAxis = d3.axisBottom(xScale);
  
    // ✅ Clear and re-render x-axis
    const xAxisGroup = svg.select('g.x-axis');
    xAxisGroup.selectAll('*').remove();
    xAxisGroup.call(xAxis);
  
    const dots = svg.select('g.dots');
  
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    dots
      .selectAll('circle')
      .data(sortedCommits, (d) => d.id)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines))
      .attr('fill', 'steelblue')
      .style('fill-opacity', 0.7)
      .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1);
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7);
        updateTooltipVisibility(false);
      });
  }
  

  function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) {
      link.href = '';
      link.textContent = '';
      date.textContent = '';
      time.textContent = '';
      author.textContent = '';
      lines.textContent = '';
      return;
    }
  
    link.href = commit.url;
    link.textContent = commit.id;
  
    date.textContent = commit.datetime?.toLocaleDateString('en', {
      dateStyle: 'full',
    });
  
    time.textContent = commit.datetime?.toLocaleTimeString('en', {
      timeStyle: 'short',
    });
  
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }
  

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  function isCommitSelected(selection, commit) {
    if (!selection) return false;
  
    const [[x0, y0], [x1, y1]] = selection;
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
  
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }
  
  function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  }
  
  function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const container = document.getElementById('language-breakdown');
    container.innerHTML = '';
  
    if (selectedCommits.length === 0) return;
  
    const lines = selectedCommits.flatMap((d) => d.lines);
  
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
      `;
    }
  }
  
  function brushed(event) {
    const selection = event.selection;
  
    d3.selectAll('circle').classed('selected', (d) =>
      isCommitSelected(selection, d)
    );
  
    renderSelectionCount(selection);
    renderLanguageBreakdown(selection);
  }
  
  function createBrushSelector(svg) {
    svg.call(d3.brush().on('start brush end', brushed));
  }
  
  
  let data = await loadData();
  let commits = processCommits(data);
  
  renderScatterPlot(data, commits);
  renderCommitInfo(data, commits);


  let commitProgress = 100;

  let timeScale = d3
    .scaleTime()
    .domain([
      d3.min(commits, (d) => d.datetime),
      d3.max(commits, (d) => d.datetime),
    ])
    .range([0, 100]);
  
  let commitMaxTime = timeScale.invert(commitProgress);
  
  function onTimeSliderChange() {
    commitProgress = +document.getElementById("commit-progress").value;
    commitMaxTime = timeScale.invert(commitProgress);
  
    document.getElementById("commit-slider-time").textContent = commitMaxTime.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
  
    // ✅ Filter and update
    const filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    updateScatterPlot(data, filteredCommits);
  }
  
  
  document.getElementById("commit-progress").addEventListener("input", onTimeSliderChange);
  onTimeSliderChange(); 
  
