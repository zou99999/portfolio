import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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
    // Put all the JS code of Steps inside this function
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
     .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    . data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
  }
  
  let data = await loadData();
  let commits = processCommits(data);
  
  renderScatterPlot(data, commits);
  renderCommitInfo(data, commits);
  console.log(commits);

  
