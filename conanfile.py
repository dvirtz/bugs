from conans import ConanFile
from datetime import datetime

class Bug(ConanFile):
  requires = "boost/1.76.0"
  default_options = {
    "boost:shared": True
  }

  def imports(self):
    self.output.info("starting import at {}".format(datetime.now().isoformat()))
    self.copy("*.so*", dst="lib", src="@libdirs")
    self.output.info("finished import at {}".format(datetime.now().isoformat()))
