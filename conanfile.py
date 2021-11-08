from conans import ConanFile

class Bug(ConanFile):
  requires = "boost/1.76.0"
  default_options = {
    "boost:shared": True
  }

  def imports(self):
    self.copy("*.so*", dst="lib", src="@libdirs")
