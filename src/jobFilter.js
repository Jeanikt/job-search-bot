function filterJobs(jobs, filters) {
  return jobs.filter(job => {
    if (filters.title && !job.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.source && job.source.toLowerCase() !== filters.source.toLowerCase()) {
      return false;
    }
    return true;
  });
}

module.exports = { filterJobs };